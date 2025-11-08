// CRS Conclave 2.0 - Firebase Event Registration Integration
// This file integrates with register.html for multiple event registration

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, set, get, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// 🔥 FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyAIlsl_OqjGjRvYTuoGmx04c4LJtJCZIiA",
    authDomain: "crs-conclave.firebaseapp.com",
    projectId: "crs-conclave",
    databaseURL: "https://crs-conclave-default-rtdb.asia-southeast1.firebasedatabase.app",
    storageBucket: "crs-conclave.firebasestorage.app",
    messagingSenderId: "678967687267",
    appId: "1:678967687267:web:9d3824573ef79f79f36056"
};

// Initialize Firebase
let app, database;
let isFirebaseConnected = false;

try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
}

// Firebase Connection Status Indicator
function createConnectionIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'firebaseStatus';
    indicator.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 25px;
        color: white;
        font-weight: bold;
        z-index: 1001;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    indicator.textContent = '🔴 Checking Firebase...';
    indicator.style.background = 'rgba(239, 68, 68, 0.9)';
    document.body.appendChild(indicator);
    
    // Click to retry connection
    indicator.addEventListener('click', testFirebaseConnection);
    
    return indicator;
}

// Test Firebase connection
async function testFirebaseConnection() {
    const indicator = document.getElementById('firebaseStatus');
    
    try {
        indicator.textContent = '🟡 Testing Connection...';
        indicator.style.background = 'rgba(245, 158, 11, 0.9)';
        
        const testRef = ref(database, 'system/connection_test');
        const testData = {
            test: true,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            page: 'event_registration'
        };
        
        await set(testRef, testData);
        
        // Verify by reading back
        const snapshot = await get(testRef);
        if (snapshot.exists()) {
            isFirebaseConnected = true;
            indicator.textContent = '🟢 Firebase Connected';
            indicator.style.background = 'rgba(34, 197, 94, 0.9)';
            
            // Clean up test data
            setTimeout(() => set(testRef, null), 2000);
            
            console.log('✅ Firebase connection successful');
            return true;
        }
        
    } catch (error) {
        console.error('❌ Firebase connection failed:', error);
        isFirebaseConnected = false;
        indicator.textContent = '🔴 Connection Failed';
        indicator.style.background = 'rgba(239, 68, 68, 0.9)';
        return false;
    }
}

// Generate unique registration ID
function generateRegistrationId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `CRS2024_EVENT_${timestamp}_${random}`;
}

// Get registration data from form
function getRegistrationData() {
    // School Information
    const schoolName = document.getElementById('school_name')?.value.trim() || '';
    const teacherName = document.getElementById('teacher_name')?.value.trim() || '';
    const teacherContact = document.getElementById('teacher_contact')?.value.trim() || '';
    const teacherEmail = document.getElementById('teacher_email')?.value.trim() || '';
    
    // Terms acceptance
    const termsAccepted = document.getElementById('termsHidden')?.checked || false;
    
    // Get selected events from global selectedEvents object with participant names
    const selectedEventsWithParticipants = {};
    const eventsData = {};
    let totalSelectedEvents = 0;
    
    // Event 1: Plitz Blitz (Team of 4)
    if (window.selectedEvents && window.selectedEvents.plitz) {
        const members = {
            member1: document.getElementById('plitz_team1_member1')?.value.trim() || '',
            member2: document.getElementById('plitz_team1_member2')?.value.trim() || '',
            member3: document.getElementById('plitz_team1_member3')?.value.trim() || '',
            member4: document.getElementById('plitz_team1_member4')?.value.trim() || ''
        };
        
        selectedEventsWithParticipants.plitz = {
            eventName: 'Plitz Blitz',
            selected: true,
            teamSize: 4,
            participants: [members.member1, members.member2, members.member3, members.member4]
        };
        
        eventsData.plitzBlitz = {
            eventName: 'Plitz Blitz',
            teamSize: 4,
            team1: members
        };
        totalSelectedEvents++;
    } else {
        selectedEventsWithParticipants.plitz = false;
    }
    
    // Event 2: Panel Discussion (Team of 2)
    if (window.selectedEvents && window.selectedEvents.panel) {
        const participants = {
            participant1: document.getElementById('panel_participant1')?.value.trim() || '',
            participant2: document.getElementById('panel_participant2')?.value.trim() || ''
        };
        
        selectedEventsWithParticipants.panel = {
            eventName: 'Panel Discussion',
            selected: true,
            teamSize: 2,
            participants: [participants.participant1, participants.participant2]
        };
        
        eventsData.panelDiscussion = {
            eventName: 'Panel Discussion',
            teamSize: 2,
            participants: participants
        };
        totalSelectedEvents++;
    } else {
        selectedEventsWithParticipants.panel = false;
    }
    
    // Event 3: Case Study (Team of 2)
    if (window.selectedEvents && window.selectedEvents.case) {
        const participants = {
            participant1: document.getElementById('case_participant1')?.value.trim() || '',
            participant2: document.getElementById('case_participant2')?.value.trim() || ''
        };
        
        selectedEventsWithParticipants.case = {
            eventName: 'Case Study',
            selected: true,
            teamSize: 2,
            participants: [participants.participant1, participants.participant2]
        };
        
        eventsData.caseStudy = {
            eventName: 'Case Study',
            teamSize: 2,
            participants: participants
        };
        totalSelectedEvents++;
    } else {
        selectedEventsWithParticipants.case = false;
    }
    
    // Event 4: Pixel Prophets (Individual)
    if (window.selectedEvents && window.selectedEvents.pixel) {
        const participant = document.getElementById('pixel_participant')?.value.trim() || '';
        
        selectedEventsWithParticipants.pixel = {
            eventName: 'Pixel Prophets',
            selected: true,
            teamSize: 1,
            participants: [participant]
        };
        
        eventsData.pixelProphets = {
            eventName: 'Pixel Prophets',
            teamSize: 1,
            participant: participant
        };
        totalSelectedEvents++;
    } else {
        selectedEventsWithParticipants.pixel = false;
    }
    
    // Event 5: Quiz (Individual)
    if (window.selectedEvents && window.selectedEvents.quiz) {
        const participant = document.getElementById('quiz_participant')?.value.trim() || '';
        
        selectedEventsWithParticipants.quiz = {
            eventName: 'Quiz',
            selected: true,
            teamSize: 1,
            participants: [participant]
        };
        
        eventsData.quiz = {
            eventName: 'Quiz',
            teamSize: 1,
            participant: participant
        };
        totalSelectedEvents++;
    } else {
        selectedEventsWithParticipants.quiz = false;
    }
    
    return {
        schoolInfo: {
            schoolName: schoolName,
            teacherName: teacherName,
            teacherContact: teacherContact,
            teacherEmail: teacherEmail
        },
        selectedEvents: selectedEventsWithParticipants,
        selectedEventsCount: totalSelectedEvents,
        eventsData: eventsData,
        agreements: {
            termsAccepted: termsAccepted
        }
    };
}

// Validate registration data
function validateRegistrationData(data) {
    const errors = [];
    
    // Validate school info
    if (!data.schoolInfo.schoolName) {
        errors.push('School name is required');
    }
    if (!data.schoolInfo.teacherName) {
        errors.push('Teacher name is required');
    }
    if (!data.schoolInfo.teacherContact) {
        errors.push('Teacher contact is required');
    }
    if (!data.schoolInfo.teacherEmail) {
        errors.push('Teacher email is required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.schoolInfo.teacherEmail && !emailRegex.test(data.schoolInfo.teacherEmail)) {
        errors.push('Teacher email format is invalid');
    }
    
    // Validate phone format (should have 10 digits)
    const phoneDigits = data.schoolInfo.teacherContact.replace(/\D/g, '');
    const cleanPhone = phoneDigits.startsWith('91') ? phoneDigits.substring(2) : phoneDigits;
    if (cleanPhone.length !== 10) {
        errors.push('Teacher contact must be a valid 10-digit phone number');
    }
    
    // Validate at least one event is selected
    if (data.selectedEventsCount === 0) {
        errors.push('At least one event must be selected');
    }
    
    // Validate event-specific data
    if (data.eventsData.plitzBlitz) {
        const team = data.eventsData.plitzBlitz.team1;
        if (!team.member1 || !team.member2 || !team.member3 || !team.member4) {
            errors.push('Plitz Blitz requires all 4 team members');
        }
    }
    
    if (data.eventsData.panelDiscussion) {
        const participants = data.eventsData.panelDiscussion.participants;
        if (!participants.participant1 || !participants.participant2) {
            errors.push('Panel Discussion requires both participants');
        }
    }
    
    if (data.eventsData.caseStudy) {
        const participants = data.eventsData.caseStudy.participants;
        if (!participants.participant1 || !participants.participant2) {
            errors.push('Case Study requires both participants');
        }
    }
    
    if (data.eventsData.pixelProphets) {
        if (!data.eventsData.pixelProphets.participant) {
            errors.push('Pixel Prophets requires a participant');
        }
    }
    
    if (data.eventsData.quiz) {
        if (!data.eventsData.quiz.participant) {
            errors.push('Quiz requires a participant');
        }
    }
    
    // Validate agreements
    if (!data.agreements.termsAccepted) {
        errors.push('You must accept the terms and conditions');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Save registration to Firebase
async function saveRegistrationToFirebase(data) {
    const registrationId = generateRegistrationId();
    
    const registrationData = {
        id: registrationId,
        timestamp: new Date().toISOString(),
        registrationDate: new Date().toLocaleDateString('en-IN'),
        registrationTime: new Date().toLocaleTimeString('en-IN'),
        
        schoolInfo: data.schoolInfo,
        selectedEvents: data.selectedEvents,
        selectedEventsCount: data.selectedEventsCount,
        eventsData: data.eventsData,
        agreements: data.agreements,
        
        status: 'registered',
        source: 'web_event_registration_v2',
        metadata: {
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            timestamp: serverTimestamp()
        }
    };
    
    // Save main registration
    const registrationRef = ref(database, `event_registrations/${registrationId}`);
    await set(registrationRef, registrationData);
    
    // Save summary for quick queries
    const summaryRef = ref(database, `event_registration_summary/${registrationId}`);
    
    // Extract event names for summary
    const eventNamesList = [];
    for (let key in data.selectedEvents) {
        if (data.selectedEvents[key] && data.selectedEvents[key].selected) {
            eventNamesList.push(data.selectedEvents[key].eventName);
        }
    }
    
    await set(summaryRef, {
        id: registrationId,
        schoolName: data.schoolInfo.schoolName,
        teacherName: data.schoolInfo.teacherName,
        teacherEmail: data.schoolInfo.teacherEmail,
        selectedEvents: eventNamesList,
        eventCount: data.selectedEventsCount,
        registrationDate: registrationData.registrationDate,
        status: 'registered'
    });
    
    return { id: registrationId, data: registrationData };
}

// Show success message
function showSuccessMessage(registrationId, data) {
    // Get list of event names
    const eventNames = [];
    for (let key in data.selectedEvents) {
        if (data.selectedEvents[key] && data.selectedEvents[key].selected) {
            eventNames.push(data.selectedEvents[key].eventName);
        }
    }
    const eventsList = eventNames.join(', ');
    
    const message = `
🎉 REGISTRATION SUCCESSFUL! 🎉

Registration ID: ${registrationId}
School: ${data.schoolInfo.schoolName}
Teacher: ${data.schoolInfo.teacherName}
Events: ${eventsList}

✅ Your registration has been successfully submitted for CRS Conclave 2.0
📧 Confirmation email will be sent to ${data.schoolInfo.teacherEmail}
💾 Please save your Registration ID: ${registrationId}

Welcome to CRS Conclave 2.0! 🚀
    `;
    
    alert(message);
    
    // Log success
    console.log('🎉 Registration successful:', {
        id: registrationId,
        school: data.schoolInfo.schoolName,
        events: eventNames
    });
    
    // Show modal if available
    if (typeof window.showSuccessModal === 'function') {
        window.showSuccessModal(registrationId, data.schoolInfo.schoolName);
    }
}

// Show error message
function showErrorMessage(errors) {
    const errorMessage = `
❌ REGISTRATION FAILED

Please fix the following issues:

${errors.map(error => `• ${error}`).join('\n')}

Please correct these issues and try again.
    `;
    
    alert(errorMessage);
}

// Initialize Firebase Integration
function initializeFirebaseIntegration() {
    console.log('🔥 Initializing Firebase integration for event registration...');
    
    // Create connection indicator
    createConnectionIndicator();
    
    // Test Firebase connection
    setTimeout(testFirebaseConnection, 1000);
    
    // Find the form
    const form = document.getElementById('eventRegistrationForm');
    if (!form) {
        console.error('❌ Event registration form not found');
        return;
    }
    
    // Override form submission
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Add Firebase-enabled event listener
    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('📝 Form submission started...');
        
        // Check Firebase connection
        if (!isFirebaseConnected) {
            alert('❌ Not connected to Firebase database.\n\nPlease check your internet connection and try again.\n\nClick the connection status indicator to retry.');
            return;
        }
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn?.textContent || 'Register for Events';
        
        try {
            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Registering...';
                submitBtn.style.background = 'rgba(156, 163, 175, 0.8)';
            }
            
            // Get form data
            const formData = getRegistrationData();
            console.log('📊 Form data collected:', formData);
            
            // Validate data
            const validation = validateRegistrationData(formData);
            if (!validation.isValid) {
                showErrorMessage(validation.errors);
                return;
            }
            
            console.log('✅ Validation passed');
            
            // Save to Firebase
            const result = await saveRegistrationToFirebase(formData);
            console.log('💾 Data saved to Firebase');
            
            // Show success message
            showSuccessMessage(result.id, result.data);
            
            // Reset form
            newForm.reset();
            
            // Reset event selections if available
            if (window.selectedEvents) {
                for (let eventName in window.selectedEvents) {
                    window.selectedEvents[eventName] = false;
                    const checkbox = document.getElementById(`${eventName}_checkbox`);
                    const container = document.getElementById(`event_${eventName}`);
                    const content = document.getElementById(`${eventName}_content`);
                    const collapseIcon = document.getElementById(`${eventName}_collapse`);
                    
                    if (checkbox) checkbox.classList.remove('checked');
                    if (container) container.classList.add('disabled');
                    if (content) content.classList.remove('expanded');
                    if (collapseIcon) collapseIcon.classList.add('collapsed');
                }
            }
            
            // Reset checkboxes
            const termsCheckbox = document.getElementById('termsCheckbox');
            const termsHidden = document.getElementById('termsHidden');
            if (termsCheckbox) termsCheckbox.classList.remove('checked');
            if (termsHidden) termsHidden.checked = false;
            
            // Update submit button state
            if (typeof window.updateSubmitButton === 'function') {
                window.updateSubmitButton();
            }
            
        } catch (error) {
            console.error('❌ Registration failed:', error);
            alert(`❌ Registration failed:\n\n${error.message}\n\nPlease try again or contact support if the problem persists.`);
        } finally {
            // Restore button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                
                // Re-check button state
                if (typeof window.updateSubmitButton === 'function') {
                    window.updateSubmitButton();
                }
            }
        }
    });
    
    console.log('✅ Firebase integration initialized');
}

// Debug functions
window.firebaseDebug = {
    testConnection: testFirebaseConnection,
    getFormData: getRegistrationData,
    validateData: () => {
        const data = getRegistrationData();
        return validateRegistrationData(data);
    },
    checkConnection: () => isFirebaseConnected,
    generateId: generateRegistrationId,
    showSelectedEvents: () => {
        console.log('Selected Events:', window.selectedEvents);
        const data = getRegistrationData();
        console.log('Form Data:', data);
    }
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebaseIntegration);
} else {
    initializeFirebaseIntegration();
}

console.log('🔥 CRS Conclave 2.0 Event Registration Firebase Integration Loaded');