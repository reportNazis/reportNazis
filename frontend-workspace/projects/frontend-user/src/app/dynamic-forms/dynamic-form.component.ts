import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuestionBase } from './question-base';
import { FormBuilderService } from './form-builder.service';
import { DynamicFormQuestionComponent } from './dynamic-form-question.component';

@Component({
    selector: 'app-dynamic-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DynamicFormQuestionComponent],
    template: `
    <div>
      <form (ngSubmit)="onSubmit()" [formGroup]="form" *ngIf="form">
        <div *ngFor="let question of questions" class="form-row">
          <app-question [question]="question" [form]="form"></app-question>
        </div>

        <div class="form-row">
          <button type="submit" [disabled]="!form.valid">Save</button>
        </div>
      </form>
    </div>
  `
})
export class DynamicFormComponent implements OnInit {
    @Input() questions: QuestionBase<string>[] | null = [];
    form!: FormGroup;

    constructor(private qcs: FormBuilderService) { }

    ngOnInit() {
        this.form = this.qcs.toFormGroup(this.questions as QuestionBase<string>[]);
    }

    onSubmit() {
        // Handle form submission
        console.log(this.form.value);
    }
}
