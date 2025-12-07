const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

class Database {
  async getOrCreateUser(telegramId, username = '', firstName = '') {
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('users')
        .update({
          username,
          first_name: firstName,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', telegramId);

      return existing;
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        telegram_id: telegramId,
        username,
        first_name: firstName
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async setUserSearching(telegramId, isSearching) {
    const { error } = await supabase
      .from('users')
      .update({
        is_searching: isSearching,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', telegramId);

    if (error) throw error;
  }

  async findRandomPartner(currentUserId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_searching', true)
      .neq('telegram_id', currentUserId)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createChatSession(user1Id, user2Id) {
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id
      })
      .select()
      .maybeSingle();

    if (sessionError) throw sessionError;

    await supabase
      .from('users')
      .update({
        is_searching: false,
        partner_id: user2Id,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', user1Id);

    await supabase
      .from('users')
      .update({
        is_searching: false,
        partner_id: user1Id,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', user2Id);

    return session;
  }

  async getUserPartner(telegramId) {
    const { data, error } = await supabase
      .from('users')
      .select('partner_id')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (error) throw error;
    return data?.partner_id;
  }

  async endChatSession(userId, partnerId, endedBy) {
    const { error: sessionError } = await supabase
      .from('chat_sessions')
      .update({
        ended_at: new Date().toISOString(),
        ended_by: endedBy
      })
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .is('ended_at', null);

    if (sessionError) throw sessionError;

    await supabase
      .from('users')
      .update({
        partner_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', userId);

    if (partnerId) {
      await supabase
        .from('users')
        .update({
          partner_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('telegram_id', partnerId);
    }
  }

  async saveMessage(sessionId, senderId, messageText) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        sender_id: senderId,
        message_text: messageText
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getCurrentSession(userId) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getStats() {
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: activeSessions } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .is('ended_at', null);

    const { count: totalSessions } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });

    return {
      totalUsers: totalUsers || 0,
      activeSessions: activeSessions || 0,
      totalSessions: totalSessions || 0
    };
  }
}

module.exports = new Database();
