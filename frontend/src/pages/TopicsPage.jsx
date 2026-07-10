import AppLayout from '../components/AppLayout';
import TopicsList from '../components/TopicsList';

export default function TopicsPage() {
  return (
    <AppLayout section="Workspace" title="Topics">
      <TopicsList />
    </AppLayout>
  );
}
