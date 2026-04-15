import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AutoComplete } from 'primeng/autocomplete';
import { RentalApiService } from '../services/rental-api.service';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  const apiMock = {
    globalSearch: jasmine.createSpy('globalSearch').and.returnValue(of([])),
  } as unknown as RentalApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent, RouterTestingModule],
      providers: [{ provide: RentalApiService, useValue: apiMock }],
    }).compileComponents();
  });

  it('should render top menubar navigation', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('p-menubar')).toBeTruthy();
    expect(element.textContent).toContain('Inicio');
    expect(element.textContent).toContain('Arriendos');
    expect(element.textContent).toContain('Panel Admin');
  });

  it('should call global search API on complete method', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    const component = fixture.componentInstance;
    component.onSearch({ query: 'zona' } as any);
    expect((apiMock.globalSearch as jasmine.Spy)).toHaveBeenCalledWith('zona');
  });

  it('should render topbar autocomplete for global search', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();

    const autoCompleteDe = fixture.debugElement.query(By.directive(AutoComplete));
    expect(autoCompleteDe).toBeTruthy();
    expect(autoCompleteDe.componentInstance.field).toBe('title');
  });

  it('should navigate when selecting a global search result', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');

    component.onResultSelect({
      value: {
        type: 'Zona',
        title: 'A-101',
        subtitle: 'Zona habitacional',
        url: '/admin/zonas/1/editar',
      },
    });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/zonas/1/editar');
  });
});
