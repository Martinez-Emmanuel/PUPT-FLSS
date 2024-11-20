import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { ThemeService } from '../../core/services/theme/theme.service';

@Component({
    selector: 'app-forbidden',
    imports: [RouterLink, MatButton, MatIcon],
    templateUrl: './forbidden.component.html',
    styleUrl: '../../../styles/error.scss'
})
export class ForbiddenComponent {
  constructor(private themeService: ThemeService) {}
}
