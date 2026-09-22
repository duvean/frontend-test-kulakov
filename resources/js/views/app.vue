<template>
    <main class="app comments-app">
        <header class="app-header">
            <div>
                <p class="eyebrow">101HOTELS</p>
                <h1 class="app-header-title">COMMENTS</h1>
            </div>
            <div class="comment-counter">{{ comments.length }}</div>
        </header>

        <section class="app-body">
            <div class="section">
                <div class="section-header controls-header">
                    <div>
                        <h2 class="section-title">List</h2>
                    </div>
                    <button class="refresh-btn" type="button" @click="fetchComments" :disabled="isLoading">
                        Reload
                    </button>
                </div>

                <div class="sort-panel">
                    <label class="field-label" for="sort-by">Sorting</label>
                    <select id="sort-by" class="filter-select" v-model="sortBy" @change="setPage(1)">
                        <option value="id">By ID</option>
                        <option value="date">By date</option>
                    </select>

                    <label class="field-label" for="sort-direction">Direction</label>
                    <select id="sort-direction" class="filter-select" v-model="sortDirection" @change="setPage(1)">
                        <option value="asc">Asc</option>
                        <option value="desc">Desc</option>
                    </select>
                </div>

                <div v-if="error" class="notice notice--error">{{ error }}</div>
                <div v-if="isLoading" class="notice">Loading...</div>

                <div v-else-if="paginatedComments.length" class="comments-list">
                    <article v-for="comment in paginatedComments" :key="comment.id" class="comment-card">
                        <div class="comment-card__top">
                            <div>
                                <span class="comment-id">#{{ comment.id }}</span>
                                <h3>{{ comment.name }}</h3>
                            </div>
                            <button class="delete-btn" type="button" @click="removeComment(comment.id)">
                                Delete
                            </button>
                        </div>

                        <p class="comment-text">{{ comment.text }}</p>
                        <time class="comment-date" :datetime="comment.date">{{ formatDate(comment.date) }}</time>
                    </article>
                </div>

                <div v-else class="empty-state">
                    <h3>No comments yet</h3>
                    <p>Add comment in a section below</p>
                </div>

                <nav v-if="totalPages > 1" class="pagination" aria-label="Pagination">
                    <button type="button" :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
                        Back
                    </button>
                    <button
                        v-for="page in totalPages"
                        :key="page"
                        type="button"
                        :class="{ active: page === currentPage }"
                        @click="setPage(page)"
                    >
                        {{ page }}
                    </button>
                    <button type="button" :disabled="currentPage === totalPages" @click="setPage(currentPage + 1)">
                        Next
                    </button>
                </nav>
            </div>

            <section class="comment-form-section">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">Add</h2>
                    </div>
                </div>

                <form class="comment-form" @submit.prevent="submitComment">
                    <label class="form-field">
                        <span>Username</span>
                        <input v-model.trim="form.name" class="modern-input" type="text" required>
                    </label>

                    <label class="form-field">
                        <span>Comment text</span>
                        <textarea
                            v-model.trim="form.text"
                            class="modern-input comment-textarea"
                            rows="4"
                            placeholder="Write sth"
                            required
                        ></textarea>
                    </label>

                    <label class="form-field">
                        <span>Date</span>
                        <date-picker
                            v-model="form.date"
                            value-type="format"
                            format="YYYY-MM-DD"
                            placeholder="Select date"
                            input-class="modern-input"
                            :clearable="false"
                            required
                        />
                    </label>

                    <button class="primary-btn" type="submit" :disabled="isSaving">
                        {{ isSaving ? 'Adding...' : 'Add comment' }}
                    </button>
                </form>
            </section>
        </section>
    </main>
</template>

<script>
import DatePicker from 'vue2-datepicker';
import { mapActions, mapGetters } from 'vuex';

const COMMENTS_PER_PAGE = 3;

export default {
    components: {
        DatePicker,
    },

    data() {
        return {
            currentPage: 1,
            sortBy: 'id',
            sortDirection: 'desc',
            form: {
                name: '',
                text: '',
                date: this.getToday(),
            },
        };
    },

    computed: {
        ...mapGetters(['comments', 'isLoading', 'isSaving', 'error']),

        sortedComments() {
            const direction = this.sortDirection === 'asc' ? 1 : -1;

            return [...this.comments].sort((a, b) => {
                const left = this.sortBy === 'date' ? new Date(a.date).getTime() : Number(a.id);
                const right = this.sortBy === 'date' ? new Date(b.date).getTime() : Number(b.id);

                if (left === right) {
                    return Number(a.id) > Number(b.id) ? direction : -direction;
                }

                return left > right ? direction : -direction;
            });
        },

        totalPages() {
            return Math.max(Math.ceil(this.sortedComments.length / COMMENTS_PER_PAGE), 1);
        },

        paginatedComments() {
            const start = (this.currentPage - 1) * COMMENTS_PER_PAGE;
            return this.sortedComments.slice(start, start + COMMENTS_PER_PAGE);
        },
    },

    watch: {
        totalPages(value) {
            if (this.currentPage > value) {
                this.currentPage = value;
            }
        },
    },

    created() {
        this.fetchComments();
    },

    methods: {
        ...mapActions(['fetchComments', 'createComment', 'deleteComment']),

        async submitComment() {
            if (!this.form.name || !this.form.text || !this.form.date) {
                return;
            }

            try {
                await this.createComment({ ...this.form });
            } catch (error) {
                return;
            }

            this.form = {
                name: '',
                text: '',
                date: this.getToday(),
            };
            this.setPage(1);
        },

        async removeComment(id) {
            try {
                await this.deleteComment(id);
            } catch (error) {
                return;
            }
        },

        setPage(page) {
            this.currentPage = Math.min(Math.max(page, 1), this.totalPages);
        },

        formatDate(date) {
            const value = new Date(date);

            if (Number.isNaN(value.getTime())) {
                return date;
            }

            return new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }).format(value);
        },

        getToday() {
            return new Date().toISOString().slice(0, 10);
        },
    },
};
</script>
