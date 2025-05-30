import KanbanBoard from './components/KanbanBoard';

const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Kanban Board</h2>
      <KanbanBoard />
    </div>
  );
};

export default Dashboard;
