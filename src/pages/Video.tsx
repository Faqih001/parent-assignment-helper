import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, PlayCircle } from "lucide-react";

// Dummy data for demonstration
const videoLibrary = [
  { id: 1, title: "Photosynthesis Explained", grade: "Grade 5", subject: "Science", url: "https://www.youtube.com/embed/UPBMG5EYydo" },
  { id: 2, title: "Solving Linear Equations", grade: "Grade 7", subject: "Mathematics", url: "https://www.youtube.com/embed/2ybjYw1gO6A" },
  { id: 3, title: "The Water Cycle", grade: "Grade 4", subject: "Science", url: "https://www.youtube.com/embed/IO9tT186mZw" },
];

const grades = [
  "All Grades", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Form 1", "Form 2", "Form 3", "Form 4"
];
const subjects = [
  "All Subjects", "Mathematics", "Science", "English", "Kiswahili", "Social Studies", "Physics", "Chemistry", "Biology", "Geography", "History", "Other"
];

export default function Video() {
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");

  const filteredVideos = videoLibrary.filter(
    v => (selectedGrade === "All Grades" || v.grade === selectedGrade) &&
         (selectedSubject === "All Subjects" || v.subject === selectedSubject)
  );

  return (
    <div className="min-h-screen-mobile bg-gradient-to-br from-background to-accent">
      <div className="container mx-auto px-4 py-4 md:py-8 min-h-screen-safe flex flex-col max-w-4xl min-h-[calc(100vh-4rem)]">
        <div className="mb-4 md:mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <PlayCircle className="h-6 w-6 text-primary" />
              Video Library
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">Watch topic videos for better understanding</p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Video
          </Button>
        </div>
        <div className="mb-4 md:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <Label htmlFor="grade" className="text-sm font-medium">Grade/Form</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade..." />
              </SelectTrigger>
              <SelectContent>
                {grades.map((gr) => (
                  <SelectItem key={gr} value={gr}>{gr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject..." />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVideos.length === 0 ? (
            <div className="col-span-2 text-center text-muted-foreground py-8">No videos found for the selected filters.</div>
          ) : (
            filteredVideos.map(video => (
              <Card key={video.id} className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">{video.title}</CardTitle>
                  <div className="text-xs text-muted-foreground">{video.subject} | {video.grade}</div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden mb-2">
                    <iframe
                      src={video.url}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
