export type VirtualFile = {
  path: string;
  content: string;
};

export class VirtualFileResolver {
  private files: Map<string, string>;

  constructor(files: VirtualFile[]) {
    this.files = new Map<string, string>(
      files.map(({ path, content }) => [this.normalize(path), content]),
    );
  }

  private normalize(path: string): string {
    return path.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+/g, "/");
  }

  resolve(fromPath: string, requestedPath: string): string | null {
    const cleanRequest = requestedPath.trim();

    if (
      !cleanRequest ||
      /^(https?:|data:|blob:|mailto:|tel:|javascript:)/i.test(cleanRequest) ||
      cleanRequest.startsWith("//")
    ) {
      return null;
    }

    try {
      const base = new URL(
        cleanRequest,
        `https://framecode.local/${this.normalize(fromPath)}`,
      );

      if (base.origin !== "https://framecode.local") {
        return null;
      }

      const decodedPath = decodeURIComponent(base.pathname);

      const path = this.normalize(decodedPath);

      if (!path || path.split("/").includes("..")) {
        return null;
      }

      return this.files.has(path) ? path : null;
    } catch {
      return null;
    }
  }

  get(path: string): string | undefined {
    return this.files.get(this.normalize(path));
  }

  has(path: string): boolean {
    return this.files.has(this.normalize(path));
  }

  getPaths(): string[] {
    return [...this.files.keys()];
  }
}
