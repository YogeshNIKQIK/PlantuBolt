import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Grid, Paper, Typography, Box, CircularProgress, List, ListItem, ListItemText, IconButton, InputBase } from '@mui/material';
import {
    AssignmentTurnedIn as CompletedIcon,
    PriorityHigh as HighPriorityIcon,
    Warning as UrgentIcon,
    Assignment as TotalIcon, Search as SearchIcon
} from '@mui/icons-material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import Lottie from "lottie-react";
import animationData from '../../../../../styles/loadingAnimation.json';
import nothingHere from '../../../../../styles/nothingHereAnimation.json';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Dashboard = ({ workspaceId }) => {  // Get workspaceId as a prop
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); // State to store search query
    const [showSearch, setShowSearch] = useState(false); // State to toggle search input visibility
    const [loadingAnimation, setLoadingAnimation] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Only make the API call once the workspaceId is available
        if (workspaceId) {
            axios.get(`/api/OnlyTaskApi/workspace/${workspaceId}/project`)  // Use workspaceId in API call
                .then((response) => {
                    setProjects(response.data.data.projects);  // Assuming response.data contains an array of projects
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching projects:", error);
                    setLoading(false);
                });
        }
    }, [workspaceId]);  // Dependency on workspaceId to refetch when it changes

    if (loading) {
        return <CircularProgress />;
    }

    // Navigate to the project edit page with loading animation
    const handleProjectClick = (projectId) => {
        setLoadingAnimation(true); // Show loading animation

        // Delay the navigation to allow the animation to be shown for a brief moment
        setTimeout(() => {
            router.push(`/post/workspace/workspace/${workspaceId}/projects/${projectId}/edit`);
            setLoadingAnimation(false); // Hide loading animation after navigation
        }, 1000); // Adjust time (e.g., 1 second) for animation to play
    };

    // Filter projects based on the search query
    const filteredProjects = projects.filter(project =>
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchToggle = () => {
        setShowSearch(!showSearch); // Toggle search input visibility
        setSearchQuery(""); // Reset search when toggling search field
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value); // Update search query state
    };

    // Filter and categorize projects by priority
    const totalProjects = projects.length;
    const urgentProjects = projects.filter(project => project.priority === 'Urgent').length;
    const highProjects = projects.filter(project => project.priority === 'High').length;
    const mediumProjects = projects.filter(project => project.priority === 'Medium').length;
    const lowProjects = projects.filter(project => project.priority === 'Low').length;

    // A reusable function to render each card with icon above the text
    const renderCard = (title, value, icon, color, shadowColor, subtitle) => (
        <Paper elevation={3} sx={{ padding: 2, textAlign: 'center', position: 'relative' }}>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: color,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2,  // Make it square
                    position: 'absolute',
                    top: -20,
                    left: 10,
                    boxShadow: `0px 4px 8px ${shadowColor}`
                }}
            >
                {icon}
            </Box>
            <Box sx={{ marginTop: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
                <Typography variant="body2" sx={{ color: '#777' }}>{subtitle}</Typography>
            </Box>
        </Paper>
    );

    // Project completion data (if needed for pie chart)
    const completedProjects = projects.filter(project => project.statusList?.some(status => status.status === 'completed')).length;
    const incompleteProjects = totalProjects - completedProjects;

    // Prepare data for priority-based bar chart
    const projectPriorityData = {
        labels: ['Urgent', 'High', 'Medium', 'Low'],
        datasets: [
            {
                label: 'Projects by Priority',
                data: [urgentProjects, highProjects, mediumProjects, lowProjects],
                backgroundColor: ['#f44336', '#ff9800', '#ffeb3b', '#8bc34a'],
            },
        ],
    };

    // Prepare data for tasks by project bar chart
    const projectNames = projects.map(project => project.projectName);
    const taskCounts = projects.map(project => project.tasks.length); // Count the number of tasks in each project

    const taskData = {
        labels: projectNames,  // Project names on the x-axis
        datasets: [
            {
                label: 'Number of Tasks',
                data: taskCounts, // Task counts on the y-axis
                backgroundColor: '#42a5f5', // Bar color
            },
        ],
    };

    // Prepare the Lottie options
    const lottieOptions = {
        loop: true,
        autoplay: true, // Play animation immediately
        animationData: animationData, // Lottie animation data
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <Box sx={{ padding: 2 }}>
            {/* Lottie Animation for Loading */}
            {loadingAnimation && (
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(217, 207, 207, 0.6)', // Dark overlay
                    zIndex: 1000, // Make sure it's on top of everything
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Lottie
                        animationData={animationData}
                        loop={true}
                        style={{ width: 200, height: 200 }}
                    />
                </Box>
            )}
            <Grid container spacing={2}>
                {/* Total Projects */}
                <Grid item xs={12} md={3}>
                    {renderCard(
                        'Total Projects',
                        totalProjects,
                        <TotalIcon sx={{ fontSize: 30, color: '#fff' }} />,
                        '#000',  // Background color for the icon (black)
                        'rgba(0, 0, 0, 0.4)',  // Shadow color for the icon
                        '+5% from last week'
                    )}
                </Grid>

                {/* Urgent Projects */}
                <Grid item xs={12} md={3}>
                    {renderCard(
                        'Urgent Projects',
                        urgentProjects,
                        <UrgentIcon sx={{ fontSize: 30, color: '#fff' }} />,
                        '#f44336',  // Red background for Urgent
                        'rgba(244, 67, 54, 0.4)',  // Shadow color for red
                        '+3% than last month'
                    )}
                </Grid>

                {/* High Priority Projects */}
                <Grid item xs={12} md={3}>
                    {renderCard(
                        'High Priority Projects',
                        highProjects,
                        <HighPriorityIcon sx={{ fontSize: 30, color: '#fff' }} />,
                        '#2196f3',  // Blue background for High Priority
                        'rgba(33, 150, 243, 0.4)',  // Shadow color for blue
                        '+1% from yesterday'
                    )}
                </Grid>

                {/* Medium Priority Projects */}
                <Grid item xs={12} md={3}>
                    {renderCard(
                        'Medium Priority Projects',
                        mediumProjects,
                        <CompletedIcon sx={{ fontSize: 30, color: '#fff' }} />,
                        '#4caf50',  // Green background for Medium Priority
                        'rgba(76, 175, 80, 0.4)',  // Shadow color for green
                        'Just updated'
                    )}
                </Grid>

                {/* Project List - Recent Projects */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 2, height: 400, overflowY: filteredProjects.length === 0 ? 'hidden' : 'auto', }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>Recent Projects</Typography>

                            {/* Search Icon and Input in Same Row */}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton onClick={handleSearchToggle} sx={{ marginLeft: 'auto' }}>
                                    <SearchIcon />
                                </IconButton>

                                {/* Show the search input field when the user clicks the search icon */}
                                {showSearch && (
                                    <InputBase
                                        placeholder="Search Projects"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        autoFocus
                                        sx={{
                                            marginLeft: 1,
                                            width: 200,
                                            padding: '4px 8px',
                                            border: '1px solid #ccc',
                                            borderRadius: 2,
                                        }}
                                    />
                                )}
                            </Box>
                        </Box>

                        {/* If no projects are found, show the Lottie animation */}
                        {filteredProjects.length === 0 ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Lottie
                                    animationData={nothingHere}
                                    loop={true}
                                    style={{ width: 300, height: 300, mb: 30 }}
                                />
                                <Typography variant="h6" sx={{ marginTop: 2, color: 'gray' }}>
                                    Nothing Here
                                </Typography>
                            </Box>
                        ) : (
                            <List>
                                {filteredProjects.map((project) => (
                                    <ListItem button key={project._id} onClick={() => handleProjectClick(project._id)}>
                                        <ListItemText primary={project.projectName} secondary={project.projectId} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>

                {/* Tasks by Project (Bar Chart) */}
                <Grid item xs={12} md={6}> {/* Adjust the size to match project list */}
                    <Paper elevation={3} sx={{ padding: 2, height: 400 }}>
                        <Typography variant="h6">Tasks per Project</Typography>
                        <Bar data={taskData} options={{
                            responsive: true,
                            plugins: {
                                legend: { display: true, position: 'top' },  // Show legend
                                tooltip: { enabled: true },                  // Enable tooltips
                            },
                        }} />
                    </Paper>
                </Grid>

                {/* Projects by Priority (Bar Chart) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Projects by Priority</Typography>
                        <Bar data={projectPriorityData} />
                    </Paper>
                </Grid>

                {/* Project Completion Status (Pie Chart, if needed) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 2, height: 390, display: 'flex', justifyContent: 'center', alignItems: 'center' }}> {/* Adjust Paper to center the chart */}
                        <Typography variant="h6" sx={{ marginBottom: 2 }}>Project Completion Status</Typography>
                        <Pie
                            data={{
                                labels: ['With Assigned Agent', 'Without Assigned Agent'], // Updated labels
                                datasets: [{
                                    data: [
                                        projects.filter(project => project.assignedAgent).length,  // Projects with assignedAgent
                                        projects.filter(project => !project.assignedAgent).length  // Projects without assignedAgent
                                    ],
                                    backgroundColor: ['#00264d', '#ccccb3'], // Colors for the pie chart
                                }]
                            }}
                            options={{
                                maintainAspectRatio: true, // Ensure it scales correctly
                                responsive: true,          // Make the chart responsive within the container
                                plugins: {
                                    legend: {
                                        position: 'top',       // Position the legend at the top
                                    },
                                },
                            }}
                        />
                    </Paper>
                </Grid>




            </Grid>
        </Box>
    );
};

export default Dashboard;
