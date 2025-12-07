import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreateDentistaData, Dentista } from '@/hooks/useDentistas';

interface DentistaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDentistaData) => Promise<boolean | Dentista | null>;
  dentista?: Dentista;
  title: string;
}

const especialidades = [
  'Clínica Geral',
  'Ortodontia',
  'Endodontia',
  'Periodontia',
  'Implantodontia',
  'Cirurgia Oral',
  'Prótese',
  'Odontopediatria',
  'Radiologia',
  'Patologia Oral'
];

export function DentistaForm({ open, onOpenChange, onSubmit, dentista, title }: DentistaFormProps) {
  console.log('DentistaForm render:', { open, dentista, title });
  
  const [formData, setFormData] = useState<CreateDentistaData>({
    nome: dentista?.nome || '',
    cro: dentista?.cro || '',
    especialidade: dentista?.especialidade || '',
    telefone: dentista?.telefone || '',
    email: dentista?.email || '',
    cpf: dentista?.cpf || '',
    endereco: dentista?.endereco || '',
    data_nascimento: dentista?.data_nascimento || '',
    status: dentista?.status || 'Ativo'
  });
  const [loading, setLoading] = useState(false);
  
  // Update form data when dentista prop changes
  useEffect(() => {
    console.log('useEffect in DentistaForm - dentista changed:', dentista);
    if (dentista) {
      setFormData({
        nome: dentista.nome || '',
        cro: dentista.cro || '',
        especialidade: dentista.especialidade || '',
        telefone: dentista.telefone || '',
        email: dentista.email || '',
        cpf: dentista.cpf || '',
        endereco: dentista.endereco || '',
        data_nascimento: dentista.data_nascimento || '',
        status: dentista.status || 'Ativo'
      });
      console.log('Form data updated with dentista data');
    } else {
      console.log('Resetting form data - no dentista');
      setFormData({
        nome: '',
        cro: '',
        especialidade: '',
        telefone: '',
        email: '',
        cpf: '',
        endereco: '',
        data_nascimento: '',
        status: 'Ativo'
      });
    }
  }, [dentista]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await onSubmit(formData);
    
    if (success) {
      onOpenChange(false);
      setFormData({
        nome: '',
        cro: '',
        especialidade: '',
        telefone: '',
        email: '',
        cpf: '',
        endereco: '',
        data_nascimento: '',
        status: 'Ativo'
      });
    }
    
    setLoading(false);
  };

  const handleChange = (field: keyof CreateDentistaData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                required
                placeholder="Nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cro">CRO *</Label>
              <Input
                id="cro"
                value={formData.cro}
                onChange={(e) => handleChange('cro', e.target.value)}
                required
                placeholder="Ex: CRO-SP 12345"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="especialidade">Especialidade *</Label>
              <Select value={formData.especialidade} onValueChange={(value) => handleChange('especialidade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value as 'Ativo' | 'Inativo')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                required
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                required
                placeholder="000.000.000-00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleChange('data_nascimento', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
              placeholder="Endereço completo"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}