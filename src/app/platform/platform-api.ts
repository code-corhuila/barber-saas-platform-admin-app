import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Http, PlatformCalls } from './platform-calls';

/** The calls, over the shell's HttpClient (it is the only one of the app, norm 5.4.1). */
@Injectable({ providedIn: 'root' })
export class PlatformApi extends PlatformCalls {
  constructor() {
    super(inject(HttpClient) as unknown as Http);
  }
}
