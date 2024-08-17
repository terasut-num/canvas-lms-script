// ==UserScript==
// @name         Canvas Student Navigation in Assignment Page
// @namespace    https://github.com/terasut-num/canvas-lms-script
// @version      1.0
// @description  Adds a dropdown or link to navigate student submissions in Canvas with support for paginated API requests and caching.
// @author       Terasut Numwong
// @match        https://*.instructure.com/courses/*/assignments/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function sleep: Creating a Pause
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Function to extract the subdomain, courseId, and assignmentId from the current URL
    function extractInfoFromUrl() {
        const urlParts = window.location.hostname.split('.');
        const subdomain = urlParts[0];      // Extracts the subdomain
        const pathParts = window.location.pathname.split('/');
        const courseId = pathParts[2];      // Extracts the part after 'courses/'
        const assignmentId = pathParts[4];  // Extracts the part after 'assignments/'
        return { subdomain, courseId, assignmentId };
    }

    // Function to generate a cache key based on the subdomain, courseId, and assignmentId
    function generateCacheKey(subdomain, courseId, assignmentId) {
        return `students_${subdomain}_${courseId}_${assignmentId}`;
    }

    // Function to fetch students from the API with pagination, with caching support
    async function fetchAllStudents(subdomain, courseId, assignmentId) {
        const cacheKey = generateCacheKey(subdomain, courseId, assignmentId);
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            console.log('Using cached student data.');
            return JSON.parse(cachedData);
        }

        let students = [];
        let page = 1;
        let morePages = true;

        while (morePages) {
            try {
                const response = await fetch(`https://${subdomain}.instructure.com/api/v1/courses/${courseId}/users?enrollment_type[]=student&per_page=100&page=${page}`);
                await sleep(1000); // Pause for 1 seconds
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                if (data.length === 0) {
                    morePages = false;
                } else {
                    students = students.concat(data.map(student => ({
                        id: student.id,
                        name: student.name
                    })));
                    page++;
                }
            } catch (error) {
                console.error('Failed to fetch students:', error);
                morePages = false;
            }
        }

        // Save the fetched student data to cache
        localStorage.setItem(cacheKey, JSON.stringify(students));

        return students;
    }

    // Function to create and add the dropdown menu for submissions page
    function createDropdown(students, subdomain, courseId, assignmentId) {
        // Create the dropdown element
        const dropdown = document.createElement('select');
        dropdown.id = 'studentDropdown';

        // Style the dropdown
        dropdown.style.margin = '10px';
        dropdown.style.fontSize = '14px';

        // Create a default option
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select a student';
        defaultOption.value = '';
        dropdown.appendChild(defaultOption);

        // Add students to the dropdown
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            dropdown.appendChild(option);
        });

        // Set the dropdown to the previously selected student if available
        const storedStudentId = localStorage.getItem('selectedStudentId');
        if (storedStudentId) {
            dropdown.value = storedStudentId;
        }

        // Add event listener to navigate when a student is selected
        dropdown.addEventListener('change', function() {
            const selectedStudentId = this.value;
            if (selectedStudentId) {
                localStorage.setItem('selectedStudentId', selectedStudentId); // Save the selected student ID
                const newUrl = `https://${subdomain}.instructure.com/courses/${courseId}/assignments/${assignmentId}/submissions/${selectedStudentId}`;
                window.location.href = newUrl;
            }
        });

        // Find the action header and insert the dropdown after it
        const actionHeader = document.querySelector('.ic-Action-header');
        if (actionHeader) {
            actionHeader.appendChild(dropdown);
        }
    }

    // Function to create and add the link for the assignments page
    function createLink(firstStudentId, subdomain, courseId, assignmentId) {
        // Create the link element
        const link = document.createElement('a');
        link.textContent = "Go to First Student Submission (Grader)";
        link.href = `https://${subdomain}.instructure.com/courses/${courseId}/assignments/${assignmentId}/submissions/${firstStudentId}`;
        link.style.display = 'block';
        link.style.margin = '10px 0';
        link.style.fontSize = '14px';
        link.style.color = '#007aff';
        link.style.textDecoration = 'none';

        // Find the right-side aside and insert the link
        const rightSideAside = document.querySelector('#right-side');
        if (rightSideAside) {
            rightSideAside.appendChild(link);
        }
    }

    // Function to clear the cache if the URL does not match the pattern
    function clearCacheIfUrlNotMatch() {
        const currentUrl = window.location.href;
        const matchPattern = /^https:\/\/.*\.instructure\.com\/courses\/\d+\/assignments\/\d+\/submissions\/\d+/;

        if (!matchPattern.test(currentUrl)) {
            const { subdomain, courseId, assignmentId } = extractInfoFromUrl();
            const cacheKey = generateCacheKey(subdomain, courseId, assignmentId);
            localStorage.removeItem(cacheKey);
            localStorage.removeItem('selectedStudentId');
            console.log('Cache cleared due to another assignment.');
        }
    }

    // Initialize the script
    async function init() {
        clearCacheIfUrlNotMatch();
        const { subdomain, courseId, assignmentId } = extractInfoFromUrl();
        const students = await fetchAllStudents(subdomain, courseId, assignmentId);
        if (students.length > 0) {
            const firstStudentId = students[0].id;

            // Check if we're on the submissions page
            if (window.location.pathname.includes('/submissions/')) {
                createDropdown(students, subdomain, courseId, assignmentId);
            } else {
                // Otherwise, we're on the assignments page
                createLink(firstStudentId, subdomain, courseId, assignmentId);
            }
        }
    }

    init();
})();
