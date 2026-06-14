db = db.getSiblingDB('educational_db');

db.resources.insertMany([
  {
    "title": "Present Simple Masterclass",
    "type": "VIDEO",
    "url": "https://www.youtube.com/watch?v=xyz",
    "level": "A1",
    "tags": ["grammar", "basics"],
    "created_at": new Date()
  },
  {
    "title": "Business English Vocabulary",
    "type": "PDF",
    "url": "https://mi-servidor.com/docs/business.pdf",
    "level": "B2",
    "tags": ["vocabulary", "work"],
    "file_size": "2MB",
    "created_at": new Date()
  }
]);

db.quizzes.insertOne({
  "title": "Test de Presente Simple",
  "questions": [
    {
      "id": "q1",
      "question": "She ___ (work) in a bank.",
      "options": ["work", "works", "working"],
      "correct": "works"
    }
  ]
});