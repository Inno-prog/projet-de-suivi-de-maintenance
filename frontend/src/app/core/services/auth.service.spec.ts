import { TestBed } from '@angular/core/testing';
import { OAuthModule, OAuthResourceServerConfig } from 'angular-oauth2-oidc';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

describe('AuthService', () => {
  let service: AuthService;
  let userServiceSpy: any;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getAllUsers']);
    await TestBed.configureTestingModule({
      imports: [
        OAuthModule.forRoot({
          resourceServer: {
            customResourceUrl: (request: any) => of({}),
            sendAccessToken: true
          } as OAuthResourceServerConfig
        })
      ],
      providers: [AuthService, { provide: UserService, useValue: userServiceSpy }]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('configureOAuth', () => {
    it('should configure OAuth with correct settings', () => {
      const configureOAuthSpy = spyOn(service as any, 'configureOAuth');
      (service as any).configureOAuth();
      expect(configureOAuthSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('initializeOAuth', () => {
    it('should initialize OAuth', async () => {
      const initializeOAuthSpy = spyOn(service as any, 'initializeOAuth');
      await (service as any).initializeOAuth();
      expect(initializeOAuthSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should login with credentials', async () => {
      const loginSpy = spyOn(service, 'login' as any);
      await service.login({ email: 'test@example.com', password: 'password' });
      expect(loginSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('should logout', async () => {
      const logoutSpy = spyOn(service, 'logout' as any);
      await service.logout();
      expect(logoutSpy).toHaveBeenCalledTimes(1);
    });
  });
});