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
    search: jasmine.createSpy('search').and.returnValue(of([])),
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

  it('should call search API on complete method', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    const component = fixture.componentInstance;
    component.onSearch({ query: 'zona' } as any);
    expect((apiMock.search as jasmine.Spy)).toHaveBeenCalledWith('zona');
  });

  it('should open search dialog with CTRL+K', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    const component = fixture.componentInstance;

    component.onWindowKeydown(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));

    expect(component.searchDialogVisible).toBeTrue();
  });

  it('should configure no-match message for global search', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const autoCompleteDe = fixture.debugElement.query(By.directive(AutoComplete));
    expect(autoCompleteDe.componentInstance.emptyMessage).toBe(component.noSearchResultsMessage);
    expect(component.noSearchResultsMessage).toBe('No se encontraron resultados para tu búsqueda.');
  });

  it('should navigate when selecting a search result', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl');

    component.onSelect({
      id: '1',
      type: 'ZONE',
      label: 'Zona: A-101',
      route: '/arriendos/1',
    });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/arriendos/1');
  });
});
