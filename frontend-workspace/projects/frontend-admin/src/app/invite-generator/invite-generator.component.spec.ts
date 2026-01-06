import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { InviteGeneratorComponent } from './invite-generator.component';
import { ManagementService } from '../../../../shared-lib/src/lib/services/management.service';

describe('InviteGeneratorComponent', () => {
  let component: InviteGeneratorComponent;
  let fixture: ComponentFixture<InviteGeneratorComponent>;
  let managementServiceMock: any;

  beforeEach(async () => {
    managementServiceMock = {
      createInvite: jasmine.createSpy('createInvite').and.returnValue(of({ code: 'TEST-CODE' }))
    };

    await TestBed.configureTestingModule({
      imports: [InviteGeneratorComponent, ReactiveFormsModule],
      providers: [
        { provide: ManagementService, useValue: managementServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InviteGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
