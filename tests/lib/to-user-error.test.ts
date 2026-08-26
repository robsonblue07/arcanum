import { toUserError } from '../../src/lib/to-user-error';

describe('toUserError', () => {
  it('traduz credenciais inválidas', () => {
    expect(toUserError(new Error('Invalid login credentials'))).toBe(
      'E-mail ou senha incorretos.',
    );
  });

  it('traduz falha de rede', () => {
    expect(toUserError(new Error('Network request failed'))).toBe(
      'Sem conexão com a internet. Verifique a rede e tente novamente.',
    );
  });

  it('traduz timeout', () => {
    expect(toUserError(new Error('timeout'))).toBe(
      'A conexão demorou demais. Verifique a internet e tente novamente.',
    );
  });

  it('traduz e-mail já cadastrado', () => {
    expect(toUserError(new Error('User already registered'))).toBe(
      'Este e-mail já possui uma conta. Entre ou recupere o acesso.',
    );
  });
});
