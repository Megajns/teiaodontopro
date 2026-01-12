import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Send, 
  Phone, 
  Video, 
  CheckCheck,
  User,
  MessageSquare,
  Clock,
  Filter
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar?: string;
}

const mockContacts: Contact[] = [
  { id: "1", name: "João Silva", lastMessage: "Olá, gostaria de confirmar meu horário", time: "10:30", unread: 2, online: true },
  { id: "2", name: "Maria Oliveira", lastMessage: "Obrigada pelo atendimento!", time: "09:15", unread: 0, online: false },
  { id: "3", name: "Consultório Dr. Ana", lastMessage: "Encaminhando o exame solicitado", time: "Ontem", unread: 0, online: true },
  { id: "4", name: "Pedro Santos", lastMessage: "Qual o valor da consulta?", time: "Ontem", unread: 1, online: false },
  { id: "5", name: "Clara Mendes", lastMessage: "Pode desmarcar pra mim?", time: "22/05", unread: 0, online: false },
];

export default function Chat() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(mockContacts[0]);
  const [message, setMessage] = useState("");

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-140px)] overflow-hidden rounded-xl border bg-background shadow-sm">
        {/* Sidebar de contatos */}
        <div className="w-80 border-r flex flex-col bg-muted/10">
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Atendimento
              </h1>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar conversas..."
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex gap-2 pb-1 overflow-x-auto">
              <Badge variant="secondary" className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200">Todos</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">Aguardando</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">Em aberto</Badge>
            </div>
          </div>

          <ScrollArea className="flex-1">
            {mockContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-border/50 ${
                  selectedContact?.id === contact.id ? "bg-green-50/50 border-l-4 border-l-green-600" : "hover:bg-muted/50"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {contact.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold truncate text-foreground">{contact.name}</h3>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{contact.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate mr-2">
                      {contact.lastMessage}
                    </p>
                    {contact.unread > 0 && (
                      <Badge className="h-5 min-w-[20px] px-1 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px]">
                        {contact.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Área de Chat */}
        {selectedContact ? (
          <div className="flex-1 flex flex-col bg-background">
            {/* Header do Chat */}
            <div className="px-4 py-3 border-b flex items-center justify-between bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {selectedContact.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm leading-none">{selectedContact.name}</h3>
                  <p className="text-[11px] text-green-600 mt-1 capitalize">
                    {selectedContact.online ? "Online" : "Visto por último: hoje às 10:15"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><Video className="h-4 w-4" /></Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><Search className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-6 bg-[#f0f2f5] dark:bg-[#0b141a]">
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex justify-center">
                  <Badge variant="outline" className="bg-background/80 text-[10px] font-normal uppercase tracking-wider">Ontem</Badge>
                </div>

                <div className="flex flex-col items-start">
                  <div className="bg-background p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] relative group">
                    <p className="text-sm">Olá Dr. Jonas, tudo bem? Como posso ajudar?</p>
                    <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-[10px] text-muted-foreground">14:20</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] relative group border border-green-200/50 dark:border-green-800/30">
                    <p className="text-sm">Gostaria de agendar uma limpeza para o João.</p>
                    <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-[10px] text-muted-foreground">14:22</span>
                      <CheckCheck className="h-3 w-3 text-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start mt-8">
                  <div className="bg-background p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] relative group">
                    <p className="text-sm">Olá, gostaria de confirmar meu horário</p>
                    <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-[10px] text-muted-foreground">10:30</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 border-t bg-background flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground"><Smile className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground"><Paperclip className="h-5 w-5" /></Button>
              <div className="flex-1 relative">
                <Input 
                  placeholder="Mensagem" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-green-500 pr-10 h-11 rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setMessage("");
                    }
                  }}
                />
              </div>
              <Button 
                size="icon" 
                className="bg-green-600 hover:bg-green-700 text-white rounded-full h-11 w-11 flex-shrink-0"
                onClick={() => setMessage("")}
              >
                <Send className="h-5 w-5 ml-0.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#0b141a]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted-foreground/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-background shadow-inner">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">WhatsApp Multi-usuário</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Selecione uma conversa para começar a atender seus pacientes em tempo real.
              </p>
              <div className="flex items-center justify-center gap-2 pt-6 text-[10px] text-muted-foreground uppercase tracking-widest">
                <Lock className="w-3 h-3" /> Criptografia de ponta a ponta
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
