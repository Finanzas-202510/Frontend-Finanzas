import {Component, EventEmitter, Output} from '@angular/core';
import {MatDivider} from '@angular/material/divider';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-informacion-general',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatFormField,
    MatRadioGroup,
    MatRadioButton,
    MatButton,
    RouterLink
  ],
  templateUrl: './informacion-general.component.html',
  styleUrl: './informacion-general.component.css'
})
export class InformacionGeneralComponent {
  selectedInterestRate: string = 'efectiva';
  selectedCurrency: string = 'usd';
  @Output() avanzarSeccion = new EventEmitter<string>();

}
