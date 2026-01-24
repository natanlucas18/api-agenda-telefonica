import { BcryptService } from './bcrypt.service';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(() => {
    service = new BcryptService();
  });

  it('should generate a hashed password', async () => {
    const hash = await service.hash('123456');

    expect(hash).toBeDefined();
    expect(hash).not.toBe('123456');
  });

  it('should compare password and hash and return true', async () => {
    const password = '123456';
    const hash = await service.hash(password);

    const result = await service.compare(password, hash);

    expect(result).toBe(true);
  });

  it('should return false when password is invalid', async () => {
    const hash = await service.hash('123456');

    const result = await service.compare('wrong-password', hash);

    expect(result).toBe(false);
  });
});
