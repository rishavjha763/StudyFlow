import AppLayout from '../components/AppLayout';
import NotesList from '../components/NotesList';

export default function NotesPage() {
  return (
    <AppLayout section="Workspace" title="Notes">
      <NotesList />
    </AppLayout>
  );
}
