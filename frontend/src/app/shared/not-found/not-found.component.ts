import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { ThemeService } from '../../core/services/theme/theme.service';

@Component({
    selector: 'app-not-found',
    imports: [RouterLink, MatButton, MatIcon],
    templateUrl: './not-found.component.html',
    styleUrl: '../../../styles/error.scss'
})
export class NotFoundComponent {
  constructor(private themeService: ThemeService) {}
}
