import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DeudaDTO } from '../../../models/admin.models';
import { AdminApiService } from '../../../services/admin-api.service';
import { DeudasStore } from './deudas.store';

describe('DeudasStore', () => {
  let store: DeudasStore;
  let apiMock: jasmine.SpyObj<AdminApiService>;

  const deudaA: DeudaDTO = {
    id: 10,
    contratoId: 7,
    fecha: '2026-04-14',
    montoTotal: 500000,
    saldoPendiente: 200000,
    motivo: 'Reparación',
    estado: 'pendiente',
  };

  const deudaB: DeudaDTO = {
    id: 11,
    contratoId: 8,
    fecha: '2026-04-15',
    montoTotal: 900000,
    saldoPendiente: 0,
    motivo: 'Servicios',
    estado: 'pagado',
  };

  beforeEach(() => {
    apiMock = jasmine.createSpyObj<AdminApiService>('AdminApiService', [
      'listPrestamos',
      'listContratos',
      'getPrestamoById',
      'createPrestamo',
      'updatePrestamo',
      'deletePrestamo',
    ]);

    apiMock.listPrestamos.and.returnValue(of([]));
    apiMock.listContratos.and.returnValue(of([]));
    apiMock.getPrestamoById.and.returnValue(of(deudaA));
    apiMock.createPrestamo.and.returnValue(of(deudaA));
    apiMock.updatePrestamo.and.returnValue(of(deudaA));
    apiMock.deletePrestamo.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
      providers: [DeudasStore, { provide: AdminApiService, useValue: apiMock }],
    });

    store = TestBed.inject(DeudasStore);
  });

  it('should load deudas and update total', () => {
    apiMock.listPrestamos.and.returnValue(of([deudaA, deudaB]));

    store.loadDeudas();

    expect(apiMock.listPrestamos).toHaveBeenCalled();
    expect(store.deudas()).toEqual([deudaA, deudaB]);
    expect(store.total()).toBe(2);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should create deuda preserving contratoId mapping in payload and prepend state', () => {
    const dto: DeudaDTO = {
      contratoId: 42,
      fecha: '2026-05-01',
      montoTotal: 300000,
      saldoPendiente: 300000,
      motivo: 'Adelanto',
      estado: 'pendiente',
    };
    const created: DeudaDTO = { ...dto, id: 99 };
    apiMock.createPrestamo.and.returnValue(of(created));

    store.loadDeudas();
    store.createDeuda(dto);

    expect(apiMock.createPrestamo).toHaveBeenCalledWith(
      jasmine.objectContaining({ contratoId: 42 })
    );
    expect(store.deudas()[0]).toEqual(created);
    expect(store.saving()).toBeFalse();
  });

  it('should update deuda and selectedDeuda', () => {
    store.loadDeudas();
    const updated: DeudaDTO = { ...deudaA, motivo: 'Reparación mayor' };
    apiMock.updatePrestamo.and.returnValue(of(updated));

    store.createDeuda(deudaA);
    store.updateDeuda(deudaA.id!, updated);

    expect(apiMock.updatePrestamo).toHaveBeenCalledWith(deudaA.id!, updated);
    expect(store.selectedDeuda()).toEqual(updated);
    expect(store.deudas().some((item) => item.id === deudaA.id && item.motivo === 'Reparación mayor')).toBeTrue();
  });

  it('should delete deuda from state', () => {
    apiMock.listPrestamos.and.returnValue(of([deudaA, deudaB]));
    store.loadDeudas();

    store.deleteDeuda(deudaA.id!);

    expect(apiMock.deletePrestamo).toHaveBeenCalledWith(deudaA.id!);
    expect(store.deudas()).toEqual([deudaB]);
  });

  it('should expose fallback error when list fails', () => {
    apiMock.listPrestamos.and.returnValue(throwError(() => ({ message: '' })));

    store.loadDeudas();

    expect(store.error()).toBe('No se pudieron cargar las deudas.');
    expect(store.loading()).toBeFalse();
  });
});
