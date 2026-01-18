import { createStore } from 'solid-js/store';
import { supabase } from '../lib/supabase';
import type { Context } from '../lib/types';

interface ContextState {
  contexts: Context[];
  currentContext: Context | null;
  loading: boolean;
  error: string | null;
}

export const [contextStore, setContextStore] = createStore<ContextState>({
  contexts: [],
  currentContext: null,
  loading: true,
  error: null,
});

export const contextActions = {
  async loadContexts() {
    try {
      setContextStore('loading', true);
      setContextStore('error', null);
      
      const { data, error } = await supabase
        .from('contexts')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setContextStore('contexts', data || []);
      
      // Load saved context from localStorage or use first context
      const savedContextId = localStorage.getItem('currentContextId');
      if (savedContextId && data) {
        const savedContext = data.find((c) => c.id === parseInt(savedContextId));
        if (savedContext) {
          setContextStore('currentContext', savedContext);
        } else if (data.length > 0) {
          setContextStore('currentContext', data[0]);
        }
      } else if (data && data.length > 0) {
        setContextStore('currentContext', data[0]);
      }
    } catch (error: any) {
      setContextStore('error', error.message);
      console.error('Error loading contexts:', error);
    } finally {
      setContextStore('loading', false);
    }
  },

  switchContext(context: Context) {
    setContextStore('currentContext', context);
    localStorage.setItem('currentContextId', context.id.toString());
  },

  async createContext(name: string, type: Context['type']) {
    try {
      const { data, error } = await supabase
        .from('contexts')
        .insert({ name, type })
        .select()
        .single();
      
      if (error) throw error;
      
      setContextStore('contexts', [...contextStore.contexts, data]);
      return data;
    } catch (error: any) {
      console.error('Error creating context:', error);
      throw error;
    }
  },

  async updateContext(id: number, name: string, type: Context['type']) {
    try {
      const { data, error } = await supabase
        .from('contexts')
        .update({ name, type })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setContextStore('contexts', contextStore.contexts.map((c) => 
        c.id === id ? data : c
      ));
      
      // Update current context if it's the one being edited
      if (contextStore.currentContext?.id === id) {
        setContextStore('currentContext', data);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error updating context:', error);
      throw error;
    }
  },

  async deleteContext(id: number) {
    try {
      const { error } = await supabase
        .from('contexts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setContextStore('contexts', contextStore.contexts.filter((c) => c.id !== id));
      
      // Switch to another context if the deleted one was active
      if (contextStore.currentContext?.id === id) {
        const remainingContexts = contextStore.contexts.filter((c) => c.id !== id);
        if (remainingContexts.length > 0) {
          this.switchContext(remainingContexts[0]);
        } else {
          setContextStore('currentContext', null);
        }
      }
    } catch (error: any) {
      console.error('Error deleting context:', error);
      throw error;
    }
  },
};
