import { Routes } from '@angular/router';

/**
 * What this domain app exposes as './routes' (ADR-013). The shell mounts them under /platform for
 * `SUPER_ADMIN` only (FR-025); every screen is lazy, so the shell downloads only what is opened.
 */
export const routes: Routes = [];
