import {Component, EventEmitter, Output} from '@angular/core';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatDivider} from '@angular/material/divider';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-datos-adicionales',
  imports: [
    MatFormField,
    MatInput,
    MatRadioGroup,
    MatRadioButton,
    MatButton
  ],
  templateUrl: './datos-adicionales.component.html',
  styleUrl: './datos-adicionales.component.css'
})
export class DatosAdicionalesComponent {
  @Output() retrocederSeccion = new EventEmitter<string>();
}
