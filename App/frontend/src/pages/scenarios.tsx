import React, { useEffect, useState } from 'react';
import { scenarioApi } from '../utils/api';

interface Scenario {
  id: string;
  name: string;
}

const ScenariosPage = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        console.log('Fetching scenarios...'); // Debug log
        const data = await scenarioApi.getScenarios();
        setScenarios(data.items);
        console.log('Scenarios loaded:', data.items); // Debug log
      } catch (err) {
        console.error('Error loading scenarios:', err); // Debug log
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      }
    };

    fetchScenarios();
  }, []);

  if (error) {
    return <div>Error loading scenarios. Please try again later.</div>;
  }

  if (!scenarios.length) {
    return <div>Loading scenarios...</div>;
  }

  return (
    <div>
      <h1>Scenarios</h1>
      <ul>
        {scenarios.map((scenario) => (
          <li key={scenario.id}>{scenario.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ScenariosPage;
