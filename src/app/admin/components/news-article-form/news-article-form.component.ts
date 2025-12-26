import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NewsArticleService } from '../../services/news-article.service';
import { NewsArticle, NewsArticleFormData } from '../../models/news-article.model';

export interface NewsArticleFormDialogData {
  mode: 'create' | 'edit';
  article?: NewsArticle;
}

@Component({
  selector: 'app-news-article-form',
  templateUrl: './news-article-form.component.html',
  styleUrls: ['./news-article-form.component.css']
})
export class NewsArticleFormComponent implements OnInit {
  articleForm: FormGroup;
  loading = false;
  isEdit: boolean;

  // Quill editor configuration
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link']
    ]
  };

  categories = [
    'ព្រំដែន',
    'Breaking News',
    'Politics',
    'Business',
    'Technology',
    'Sports',
    'Entertainment',
    'Health',
    'Science',
    'World',
    'Local'
  ];

  statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  constructor(
    private fb: FormBuilder,
    private newsArticleService: NewsArticleService,
    private dialogRef: MatDialogRef<NewsArticleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewsArticleFormDialogData
  ) {
    this.isEdit = data.mode === 'edit';
    this.articleForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.article) {
      this.populateForm(this.data.article);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      category: ['', Validators.required],
      status: ['draft', Validators.required],
      tags: [''],
      featuredImage: [''],
      summary: [''],
      political_perspective: [''],
      cambodia_impact: ['']
    });
  }

  private populateForm(article: NewsArticle): void {
    this.articleForm.patchValue({
      title: article.title,
      content: article.content,
      author: article.author,
      category: article.category,
      status: article.status,
      tags: article.tags.join(', '),
      featuredImage: article.featuredImage || '',
      summary: article.summary || '',
      political_perspective: article.political_perspective || '',
      cambodia_impact: article.cambodia_impact || ''
    });
  }

  onSubmit(): void {
    if (this.articleForm.valid && !this.loading) {
      this.loading = true;
      const formValue = this.articleForm.value;
      
      console.log('Form values:', formValue);
      
      const articleData: NewsArticleFormData = {
        title: formValue.title.trim(),
        content: formValue.content.trim(),
        author: formValue.author.trim(),
        category: formValue.category,
        status: formValue.status,
        tags: this.processTags(formValue.tags)
      };

      // Only include featuredImage if it has a value
      const featuredImageValue = formValue.featuredImage?.trim();
      if (featuredImageValue) {
        articleData.featuredImage = featuredImageValue;
      }

      // Include rich text fields (always include them, even if empty)
      articleData.summary = formValue.summary || '';
      articleData.political_perspective = formValue.political_perspective || '';
      articleData.cambodia_impact = formValue.cambodia_impact || '';
      
      console.log('Article data to save:', articleData);

      if (this.isEdit) {
        this.updateArticle(articleData);
      } else {
        this.createArticle(articleData);
      }
    }
  }

  private createArticle(articleData: NewsArticleFormData): void {
    this.newsArticleService.createArticle(articleData).subscribe({
      next: (articleId) => {
        console.log('Article created with ID:', articleId);
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error creating article:', error);
        this.loading = false;
        alert('Error creating article. Please try again.');
      }
    });
  }

  private updateArticle(articleData: NewsArticleFormData): void {
    if (!this.data.article?.id) return;
    
    this.newsArticleService.updateArticle(this.data.article.id, articleData).subscribe({
      next: () => {
        console.log('Article updated successfully');
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error updating article:', error);
        this.loading = false;
        alert('Error updating article. Please try again.');
      }
    });
  }

  private processTags(tagsString: string): string[] {
    if (!tagsString || !tagsString.trim()) return [];
    
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Form field error getters
  getTitleErrorMessage(): string {
    const control = this.articleForm.get('title');
    if (control?.hasError('required')) return 'Title is required';
    if (control?.hasError('minlength')) return 'Title must be at least 5 characters';
    if (control?.hasError('maxlength')) return 'Title must not exceed 200 characters';
    return '';
  }

  getContentErrorMessage(): string {
    const control = this.articleForm.get('content');
    if (control?.hasError('required')) return 'Content is required';
    if (control?.hasError('minlength')) return 'Content must be at least 50 characters';
    return '';
  }

  getAuthorErrorMessage(): string {
    const control = this.articleForm.get('author');
    if (control?.hasError('required')) return 'Author is required';
    if (control?.hasError('minlength')) return 'Author must be at least 2 characters';
    if (control?.hasError('maxlength')) return 'Author must not exceed 100 characters';
    return '';
  }

  getCategoryErrorMessage(): string {
    const control = this.articleForm.get('category');
    if (control?.hasError('required')) return 'Category is required';
    return '';
  }
}