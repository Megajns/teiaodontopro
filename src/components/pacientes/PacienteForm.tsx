import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Paciente, CreatePacienteData } from '@/hooks/usePacientes';

interface PacienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePacienteData) => Promise<void>;
  paciente?: Paciente | null;
  title: string;
}

export function PacienteForm({ isOpen, onClose, onSubmit, paciente, title }: PacienteFormProps) {
  const [formData, setFormData] = useState<CreatePacienteData>({
    nome: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    ultima_consulta: '',
    status: 'Ativo',
    endereco: '',
    cpf: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Update form data when paciente prop changes
  useEffect(() => {
    if (paciente) {
      setFormData({
        nome: paciente.nome || '',
        email: paciente.email || '',
        telefone: paciente.telefone || '',
        data_nascimento: paciente.data_nascimento || '',
        ultima_consulta: paciente.ultima_consulta || '',
        status: paciente.status || 'Ativo',
        endereco: paciente.endereco || '',
        cpf: paciente.cpf || ''
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        data_nascimento: '',
        ultima_consulta: '',
        status: 'Ativo',
        endereco: '',
        cpf: ''
      });
    }
  }, [paciente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handled by parent component
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePacienteData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ultima_consulta">Última Consulta</Label>
              <Input
                id="ultima_consulta"
                type="date"
                value={formData.ultima_consulta}
                onChange={(e) => handleInputChange('ultima_consulta', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: 'Ativo' | 'Inativo') => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}