# LocalFontManager

```ts
interface FontData {
  postscriptName: string;
  fullName: string;
  family: string;
  style: string;
}

type ChromePermissionName =
  | PermissionName
  | "microphone"
  | "camera"
  | "local-fonts"
  | "clipboard-read"
  | "clipboard-write";
export class NavigatorPermissions {
  static async checkPermission(permissionName: ChromePermissionName) {
    const result = await navigator.permissions.query({
      name: permissionName as PermissionName,
    });
    return result.state;
  }
}

class LocalFontManager {
  public availableFonts: FontData[] = [];

  async requestFonts() {
    try {
      const availableFonts = await window.queryLocalFonts();
      this.availableFonts = [...availableFonts];
    } catch (err) {
      console.error(err.name, err.message);
    }
  }

  async getLocalFontsPermission() {
    return await NavigatorPermissions.checkPermission("local-fonts");
  }
}
```
