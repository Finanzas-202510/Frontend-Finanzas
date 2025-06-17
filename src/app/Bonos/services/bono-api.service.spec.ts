import { TestBed } from '@angular/core/testing';

import { BonoApiService } from './bono-api.service';

describe('BonoApiService', () => {
  let service: BonoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BonoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
