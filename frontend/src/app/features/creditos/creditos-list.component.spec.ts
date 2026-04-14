import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { RentalApiService } from '../../services/rental-api.service';
import { CreditosListComponent } from './creditos-list.component';

describe('CreditosListComponent', () => {
  const apiMock = {
    getCreditsSummary: jasmine.createSpy('getCreditsSummary').and.returnValue(
      of({ creditCards: [], loans: [], others: [] })
    ),
  } as unknown as RentalApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditosListComponent, RouterTestingModule],
      providers: [{ provide: RentalApiService, useValue: apiMock }],
    }).compileComponents();
  });

  it('should render empty state and add debt CTA when there are no records', () => {
    const fixture = TestBed.createComponent(CreditosListComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('No existen deudas registradas.');
    expect(element.textContent).toContain('Agregar Deuda');
  });

  it('should navigate to add debt flow when clicking empty state CTA', () => {
    const fixture = TestBed.createComponent(CreditosListComponent);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');
    fixture.detectChanges();

    const addDebtButton = fixture.nativeElement.querySelector('button.debt-link') as HTMLButtonElement;
    addDebtButton.click();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/creditos/nuevo');
  });
});
