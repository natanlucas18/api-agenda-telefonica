import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service";
import { GenerateTokens } from "src/types/generate-tokens";
import { LoginDto } from "./dto/login.dto";
import { UnauthorizedException } from "@nestjs/common";

describe('AuthController', () => {
    let authController: AuthController;
    let authService: jest.Mocked<AuthService>;

    const responseMock: GenerateTokens = {
        id: 'uuid',
        name: 'lucas',
        email: 'lucas@email.com',
        accessToken: '35a2b',
        expiresIn: 3600
    }

    beforeEach(async () => {
        const module:TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{
                provide: AuthService,
                useValue: {
                    login: jest.fn(),
                },
            }],
        }).compile();


        authController = module.get<AuthController>(AuthController);
        authService = module.get(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(authController).toBeDefined();
    });

    describe('login', () => {
        it('should call authService.login with the correct dto', async () => {
            authService.login.mockResolvedValue(responseMock);
            const loginDto:LoginDto = {
                email: 'lucas@email.com',
                password: '123456'
            }

            const result = await authController.login(loginDto);

            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual(responseMock);
        });

        it('should propagate UnathorizedException', async () => {
            authService.login.mockRejectedValue(
                new UnauthorizedException()
            );

            expect(authController.login({
                email: 'natan@email.com',
                password: '456789'
        })).rejects.toThrow(UnauthorizedException)
        })
    })
})