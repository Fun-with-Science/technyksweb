import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from './courses.service';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progressPercent: number;
  lastWatchedLessonId?: string;
  completedLessonIds: string[];
  course: Course;
  createdAt: string;
  updatedAt: string;
}

export interface PlaybackTokenResponse {
  lessonId: string;
  title: string;
  isFreePreview: boolean;
  videoAvailable: boolean;
  embedUrl: string | null;
  expires: number;
  token: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentsService {
  private http = inject(HttpClient);

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>('/api/enrollments/my');
  }

  updateProgress(payload: { courseId: string; lessonId: string; isCompleted?: boolean }): Observable<Enrollment> {
    return this.http.post<Enrollment>('/api/enrollments/progress', payload);
  }

  getVideoToken(lessonId: string): Observable<PlaybackTokenResponse> {
    return this.http.get<PlaybackTokenResponse>(`/api/video/token/${lessonId}`);
  }

  getCertificate(courseId: string): Observable<{ certificateNumber: string; pdfUrl: string }> {
    return this.http.get<{ certificateNumber: string; pdfUrl: string }>(`/api/enrollments/certificate/${courseId}`);
  }
}
