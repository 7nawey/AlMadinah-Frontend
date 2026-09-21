import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { I18nService } from './core/i18n/i18n.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Al-Madinah-Al-Munawwarah';

  private routerSub?: Subscription;
  private viewportMeta?: HTMLMetaElement;
  private viewportRestoreTimer?: ReturnType<typeof setTimeout>;

  private static readonly VIEWPORT_NORMAL = 'width=device-width, initial-scale=1';
  private static readonly VIEWPORT_PINNED = 'width=device-width, initial-scale=1, maximum-scale=1';

  constructor(
    private i18n: I18nService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.i18n.init();
    this.viewportMeta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]') ?? undefined;
    this.guardMobileZoom();
  }

  /**
   * Mobile browsers (iOS Safari AND Chrome Android) auto-zoom the page when a
   * small-font input is focused, and that zoom persists through SPA navigation
   * (login/register -> home), leaving the whole site rendered as a narrow strip
   * until a full refresh. Primary prevention is the 16px input rule in
   * styles.css; this is the safety net that resets any zoom that still forms.
   *
   *  - NavigationStart: blur the focused element while the source component
   *    (login form) still exists, and PIN the viewport (maximum-scale=1) so the
   *    browser is forced back to scale=1 before the new page renders.
   *  - NavigationEnd + delayed re-runs: the browser applies focus-zoom
   *    asynchronously (100-300ms after focus), so we re-assert the reset a few
   *    times, then restore the normal viewport (keeping pinch-zoom available).
   */
  private guardMobileZoom(): void {
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl && typeof activeEl.blur === 'function') {
          activeEl.blur();
        }
        this.pinViewport();
      }

      if (event instanceof NavigationEnd) {
        this.resetVisualViewport();
        setTimeout(() => this.resetVisualViewport(), 150);
        setTimeout(() => this.resetVisualViewport(), 450);
        // Keep the pin through the async zoom window, then restore it so the
        // user keeps full pinch-zoom accessibility on the destination page.
        setTimeout(() => this.restoreViewport(), 700);
      }
    });
  }

  /** Forces the visual viewport back to scale=1. Reliable on iOS Safari and
   *  Chrome Android (the style.zoom trick alone is ignored by many Chrome
   *  versions), at the cost of disabling pinch-zoom until restoreViewport(). */
  private pinViewport(): void {
    if (!this.viewportMeta) return;
    if (this.viewportRestoreTimer) {
      clearTimeout(this.viewportRestoreTimer);
      this.viewportRestoreTimer = undefined;
    }
    this.viewportMeta.setAttribute('content', AppComponent.VIEWPORT_PINNED);
  }

  private restoreViewport(): void {
    if (!this.viewportMeta) return;
    // Double-rAF after restoring so any pending browser zoom re-settles.
    this.viewportMeta.setAttribute('content', AppComponent.VIEWPORT_NORMAL);
    requestAnimationFrame(() => this.resetVisualViewport());
  }

  private resetVisualViewport(): void {
    // Non-standard property; resets iOS Safari's persisted focus-zoom.
    document.documentElement.style.zoom = '1';

    // In RTL, (0, 0) is the right edge — the correct "start" of an RTL page,
    // so this recenters correctly for both text directions.
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      document.documentElement.style.zoom = '';
    });
  }
}
