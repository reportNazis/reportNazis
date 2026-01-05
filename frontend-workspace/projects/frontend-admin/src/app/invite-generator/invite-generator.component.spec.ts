import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteGeneratorComponent } from './invite-generator.component';

describe('InviteGeneratorComponent', () => {
  let component: InviteGeneratorComponent;
  let fixture: ComponentFixture<InviteGeneratorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InviteGeneratorComponent]
    });
    fixture = TestBed.createComponent(InviteGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
