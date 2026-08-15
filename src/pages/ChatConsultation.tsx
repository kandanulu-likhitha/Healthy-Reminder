import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  ArrowLeft, 
  Phone, 
  Video,
  MoreVertical,
  Loader2,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Consultation {
  id: string;
  doctor_id: string;
  patient_id: string;
  disease_name: string | null;
  status: string;
  scheduled_at: string | null;
}

const ChatConsultation = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth(true);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherUser, setOtherUser] = useState<{ full_name: string | null; email: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConsultation = useCallback(async () => {
    if (!consultationId) return;

    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .single();

    if (error) {
      console.error('Error fetching consultation:', error);
      toast({
        title: "Error",
        description: "Failed to load consultation",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }

    setConsultation(data);

    // Fetch the other user's profile
    const otherUserId = data.doctor_id === user?.id ? data.patient_id : data.doctor_id;
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', otherUserId)
      .single();

    setOtherUser(profileData);
  }, [consultationId, user?.id, toast, navigate]);

  const fetchMessages = useCallback(async () => {
    if (!consultationId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
      // Mark messages as read
      if (user) {
        await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .eq('consultation_id', consultationId)
          .eq('receiver_id', user.id);
      }
    }
    setLoading(false);
  }, [consultationId, user]);

  const subscribeToMessages = useCallback(() => {
    const channel = supabase
      .channel(`chat-${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `consultation_id=eq.${consultationId}`
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMsg]);
          
          // Mark as read if we're the receiver
          if (newMsg.receiver_id === user?.id) {
            supabase
              .from('chat_messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultationId, user?.id]);

  useEffect(() => {
    if (user && consultationId) {
      fetchConsultation();
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return unsubscribe;
    }
  }, [user, consultationId, fetchConsultation, fetchMessages, subscribeToMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !consultation || !newMessage.trim()) return;

    setSending(true);

    const receiverId = consultation.doctor_id === user.id 
      ? consultation.patient_id 
      : consultation.doctor_id;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        consultation_id: consultation.id,
        sender_id: user.id,
        receiver_id: receiverId,
        message: newMessage.trim()
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } else {
      setNewMessage('');
    }
    setSending(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Consultation not found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const isDoctor = role === 'doctor';
  const otherName = otherUser?.full_name || otherUser?.email || (isDoctor ? 'Patient' : 'Doctor');

  return (
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-80px)] flex flex-col">
      {/* Chat Header */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {otherName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{otherName}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {consultation.disease_name && (
                  <Badge variant="outline">{consultation.disease_name}</Badge>
                )}
                <Badge variant={consultation.status === 'active' ? 'default' : 'secondary'}>
                  {consultation.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled>
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" disabled>
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <p>{message.message}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {format(new Date(message.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        This chat is for consultation purposes only. For emergencies, call your local emergency services.
      </p>
    </div>
  );
};

export default ChatConsultation;
