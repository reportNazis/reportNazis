import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuestionBase } from './question-base';

@Component({
    selector: 'app-question',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div [formGroup]="form">
      <label [attr.for]="question.key">{{question.label}}</label>

      <div [ngSwitch]="question.controlType">

        <input *ngSwitchCase="'textbox'" 
               [formControlName]="question.key"
               [id]="question.key" 
               [type]="question.type">

        <select *ngSwitchCase="'dropdown'" 
                [formControlName]="question.key"
                [id]="question.key">
          <option *ngFor="let opt of question.options" [value]="opt.key">{{opt.value}}</option>
        </select>

      </div> 
      
      <div class="errorMessage" *ngIf="isValid">
        {{question.label}} is required
      </div>
    </div>
  `
})
export class DynamicFormQuestionComponent {
    @Input() question!: QuestionBase<string>;
    @Input() form!: FormGroup;

    get isValid() {
        return this.form.controls[this.question.key].valid;
    }
}
