import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RentalApiService } from '../../services/rental-api.service';
import { ServiciosDetailComponent } from './servicios-detail.component';

describe('ServiciosDetailComponent', () => {
  const apiMock = {
    getServiceDetail: jasmine.createSpy('getServiceDetail').and.returnValue(
      of({
        address: 'Calle 123',
        totalValue: 220000,
        services: [
          {
            responsible: 'Inquilino 1',
            value: 100000,
            type: 'LIGHT',
            status: 'pending',
            isShared: true,
            marker: '💡',
          },
          {
            responsible: 'Inquilino 2',
            value: 120000,
            type: 'OTHER',
            status: 'pending',
            isShared: false,
            marker: '📌',
          },
        ],
      })
    ),
  } as unknown as RentalApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosDetailComponent],
      providers: [
        { provide: RentalApiService, useValue: apiMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', '1']]) } },
        },
      ],
    }).compileComponents();
  });

  it('should render service emoji and fallback type label', () => {
    const fixture = TestBed.createComponent(ServiciosDetailComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('💡');
    expect(element.textContent).toContain('Otro');
  });
});
