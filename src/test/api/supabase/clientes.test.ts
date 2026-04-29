import { describe, expect, it } from 'vitest';
import { clientToNovoClientePayload } from '@/api/supabase/clientes';
import type { Client } from '@/types';

describe('clientToNovoClientePayload', () => {
  const baseClient: Omit<Client, 'id' | 'createdAt'> = {
    name: 'John Doe',
    docType: 'CPF',
    docNumber: '12345678900',
    isActive: true,
    notes: '',
    tradeName: '',
    phone: '',
    email: '',
    cep: '',
    address: '',
    addressNumber: '',
    district: '',
    city: '',
    state: '',
  };

  it('maps basic required fields correctly', () => {
    const payload = clientToNovoClientePayload(baseClient);

    expect(payload.nome).toBe('John Doe');
    expect(payload.documento).toBe('12345678900');
    expect(payload.tipo_documento).toBe('CPF');
    expect(payload.status).toBe(true);
    expect(payload.observacao).toBeUndefined();
    expect(payload.nome_fantasia).toBeUndefined();
  });

  it('maps optional fields when provided', () => {
    const payload = clientToNovoClientePayload({
      ...baseClient,
      notes: 'Some notes',
      tradeName: 'JD Corp',
    });

    expect(payload.observacao).toBe('Some notes');
    expect(payload.nome_fantasia).toBe('JD Corp');
  });

  it('generates endereco when cep is present', () => {
    const payload = clientToNovoClientePayload({
      ...baseClient,
      cep: '12345-678',
      state: 'SP',
      city: 'São Paulo',
      district: 'Centro',
      address: 'Rua A',
      addressNumber: '123',
    });

    expect(payload.endereco).toBeDefined();
    expect(payload.endereco).toEqual({
      cep: '12345-678',
      uf: 'SP',
      estado: 'SP',
      cidade: 'São Paulo',
      bairro: 'Centro',
      rua: 'Rua A',
      numero: '123',
    });
  });

  it('generates endereco when address is present', () => {
    const payload = clientToNovoClientePayload({
      ...baseClient,
      address: 'Rua B',
    });

    expect(payload.endereco).toBeDefined();
    expect(payload.endereco?.rua).toBe('Rua B');
  });

  it('generates endereco when city is present', () => {
    const payload = clientToNovoClientePayload({
      ...baseClient,
      city: 'Rio de Janeiro',
    });

    expect(payload.endereco).toBeDefined();
    expect(payload.endereco?.cidade).toBe('Rio de Janeiro');
  });

  it('omits endereco when cep, address, and city are absent', () => {
    const payload = clientToNovoClientePayload({
      ...baseClient,
      cep: '',
      address: '',
      city: '',
    });

    expect(payload.endereco).toBeUndefined();
  });

  it('maps phone and email to contatos', () => {
    const payload = clientToNovoClientePayload({
      ...baseClient,
      phone: '11999999999',
      email: 'john@example.com',
    });

    expect(payload.contatos).toBeDefined();
    expect(payload.contatos).toHaveLength(2);
    expect(payload.contatos).toContainEqual({ contato: '11999999999', tipo_contato: 'telefone' });
    expect(payload.contatos).toContainEqual({ contato: 'john@example.com', tipo_contato: 'email' });
  });

  it('returns empty contatos when phone and email are absent', () => {
    const payload = clientToNovoClientePayload({
      ...baseClient,
      phone: '',
      email: '',
    });

    expect(payload.contatos).toBeDefined();
    expect(payload.contatos).toHaveLength(0);
  });
});
