import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RentalApiService } from '../../services/rental-api.service';
import { ArriendosDetailComponent } from './arriendos-detail.component';

describe('ArriendosDetailComponent', () => {
  const apiMock = {
    getRentDetailByPeriod: jasmine.createSpy('getRentDetailByPeriod').and.returnValue(
      of({
        zoneId: 1,
        zoneName: 'A-101',
        year: 2026,
        month: 4,
        tenantName: 'Jane Doe',
        rentValue: 1500000,
        status: 'pagado',
        statusIcon: 'check',
        months: [
          { year: 2026, month: 4, status: 'pagado', statusIcon: 'check' },
          { year: 2026, month: 3, status: 'pendiente', statusIcon: 'warning' },
        ],
        payments: [
          {
            id: 11,
            estado: 'PAGADO',
            tipoPago: 'NEQUI',
            montoEsperado: 1500000,
            montoPagado: 1500000,
            fechaPago: '2026-04-10',
          },
        ],
      })
    ),
  } as unknown as RentalApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArriendosDetailComponent],
      providers: [
        { provide: RentalApiService, useValue: apiMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', '1']]) } },
        },
      ],
    }).compileComponents();
  });

  it('should load initial detail and update on month change', () => {
    const fixture = TestBed.createComponent(ArriendosDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect((apiMock.getRentDetailByPeriod as jasmine.Spy)).toHaveBeenCalledWith(1, jasmine.any(Number), jasmine.any(Number));

    component.onMonthClick({ year: 2026, month: 3 });

    expect((apiMock.getRentDetailByPeriod as jasmine.Spy)).toHaveBeenCalledWith(1, 2026, 3);
  });
});
