/// <reference types="vite/client" />

declare global {
  // SweetAlert2 is loaded from CDN in `index.html`.
  // Declare a minimal global `Swal` interface to avoid importing the npm package
  // while still providing usable typings (avoids explicit `any`).
  interface SweetAlertResult {
    isConfirmed: boolean
    isDenied: boolean
    isDismissed: boolean
    value?: unknown
    dismiss?: string
  }

  interface SweetAlertStatic {
    fire: (...args: unknown[]) => Promise<SweetAlertResult>
    // add other methods/properties here if you need them
  }

  const Swal: SweetAlertStatic
}

export {}
