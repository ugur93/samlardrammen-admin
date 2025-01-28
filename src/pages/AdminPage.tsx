import {
  Container,
  CircularProgress,
  Typography,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import supabase from '../supabase';
import PageTemplate from './PageTemplate';
import { Person } from '../types/personTypes';

export default function AdminPage() {
  return (
    <PageTemplate>
      <PersonTable />
    </PageTemplate>
  );
}

// Type Definition for Person

const fetchPersons = async (): Promise<Person[]> => {
  const { data, error } = await supabase.from<'person', Person>('person').select('*');
  if (error) throw new Error(error.message);
  return data || [];
};

const PersonTable: React.FC = () => {
  // React Query to fetch data
  const { data } = useSuspenseQuery<Person[], Error>({
    queryKey: ['persons'], // Unique key for the query
    queryFn: fetchPersons, // Function to fetch data
  });


  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom color='black'>
        Uyeler
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((person) => (
              <TableRow key={person.id}>
                <TableCell>{person.id}</TableCell>
                <TableCell>{person.navn}</TableCell>
                <TableCell>{new Date(person.fødselsdato).toLocaleDateString()}</TableCell>
                <TableCell>{person.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};
