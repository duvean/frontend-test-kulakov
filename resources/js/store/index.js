import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        comments: [],
        isLoading: false,
        isSaving: false,
        error: null,
    },

    getters: {
        comments: state => state.comments,
        isLoading: state => state.isLoading,
        isSaving: state => state.isSaving,
        error: state => state.error,
    },

    mutations: {
        SET_LOADING(state, value) {
            state.isLoading = value;
        },
        SET_SAVING(state, value) {
            state.isSaving = value;
        },
        SET_ERROR(state, error) {
            state.error = error;
        },
        SET_COMMENTS(state, comments) {
            state.comments = comments;
        },
        ADD_COMMENT(state, comment) {
            state.comments.push(comment);
        },
        REMOVE_COMMENT(state, id) {
            state.comments = state.comments.filter(comment => comment.id !== id);
        },
    },

    actions: {
        async fetchComments({ commit }) {
            commit('SET_LOADING', true);
            commit('SET_ERROR', null);

            try {
                const { data } = await axios.get('/api/comments');
                commit('SET_COMMENTS', Array.isArray(data) ? data : []);
            } catch (error) {
                commit('SET_ERROR', 'Error loading comments');
            } finally {
                commit('SET_LOADING', false);
            }
        },

        async createComment({ commit }, payload) {
            commit('SET_SAVING', true);
            commit('SET_ERROR', null);

            try {
                const { data } = await axios.post('/api/comments', payload);
                commit('ADD_COMMENT', data);
            } catch (error) {
                commit('SET_ERROR', 'Error adding comment');
                throw error;
            } finally {
                commit('SET_SAVING', false);
            }
        },

        async deleteComment({ commit }, id) {
            commit('SET_ERROR', null);

            try {
                await axios.delete(`/api/comments/${id}`);
                commit('REMOVE_COMMENT', id);
            } catch (error) {
                commit('SET_ERROR', 'Error deleting comment');
                throw error;
            }
        },
    },
});
