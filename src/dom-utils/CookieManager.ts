export class CookieManager {
  private cookies: Record<string, string>;
  constructor() {
    this.cookies = this.getCurrentCookies();
  }

  fetchLatestCookies() {
    this.cookies = this.getCurrentCookies();
    return { ...this.cookies };
  }

  private getCurrentCookies(): Record<string, string> {
    if (document.cookie === "") {
      return {};
    }
    const cookiePairs = document.cookie.split("; ");
    return cookiePairs.reduce((accumulator, pair) => {
      const [key, value] = pair.split("=");
      return {
        ...accumulator,
        [key]: value,
      };
    }, {});
  }

  toJSON() {
    return JSON.stringify(this.cookies);
  }

  setCookie(
    key: string,
    value: string,
    options?: {
      exdays?: number;
      path?: `/${string}`;
      secure?: boolean;
      sameSite?: "Strict" | "Lax";
    }
  ) {
    const expires = options?.exdays
      ? `max-age=${options.exdays * 24 * 60 * 60}`
      : "";
    const path = options?.path ? `path=${options.path}` : "path=/";
    const secure = options?.secure ? "secure" : "";
    const sameSite = options?.sameSite ? `samesite=${options.sameSite}` : "";

    const extraOptions = [expires, path, secure, sameSite]
      .filter((s) => s !== "")
      .join("; ");

    document.cookie =
      encodeURIComponent(key) +
      "=" +
      encodeURIComponent(value) +
      "; " +
      extraOptions;
    this.cookies[key] = value;
  }

  static getCookie(cname: string) {
    let name = encodeURIComponent(cname) + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  deleteCookie(key: string) {
    let expires = "max-age=0";
    document.cookie = encodeURIComponent(key) + "=" + "; " + expires + "; ";
    if (CookieManager.getCookie(key)) {
      return false;
    }
    delete this.cookies[key];
    return true;
  }
}
