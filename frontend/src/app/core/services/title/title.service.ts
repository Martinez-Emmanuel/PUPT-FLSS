import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private baseTitle = 'PUPT–FLSS';

  constructor(
    private titleService: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  initializeTitleService() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const pageTitle = this.getTitle(this.activatedRoute.root);
      this.setTitle(pageTitle);
    });
  }

  private getTitle(route: ActivatedRoute): string {
    let title = '';
    if (route.firstChild) {
      title = this.getTitle(route.firstChild);
    }
    if (route.snapshot.data['pageTitle']) {
      title = route.snapshot.data['pageTitle'];
    }
    return title;
  }

  private setTitle(pageTitle: string) {
    if (pageTitle) {
      this.titleService.setTitle(`${this.baseTitle} | ${pageTitle}`);
    } else {
      this.titleService.setTitle(this.baseTitle);
    }
  }
} 