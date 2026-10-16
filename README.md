# CampusSpace AI 🏫

### Smart Campus Room Finder and Recommendation System

CampusSpace AI is a data-driven web application designed to help students, faculty, and campus organizers identify suitable rooms for classes, meetings, study sessions, and events.

The project analyzes room capacity, available facilities, class schedules, and event records to recommend suitable rooms based on user requirements.

## 🎯 Problem Statement

Finding a suitable room on campus can be difficult when room information, facilities, and schedules are spread across different records. This can lead to inefficient space utilization and delays in organizing classes, meetings, and events.

## 💡 Proposed Solution

CampusSpace AI provides a centralized room-finding interface that filters and ranks rooms according to user requirements. It aims to make room selection easier through explainable, data-driven recommendations.

## ✨ Key Features

- **Room Finder:** Search for rooms based on date, time, duration, and expected attendance.
- **Capacity Filtering:** Find rooms that can accommodate the required number of people.
- **Facility Filtering:** Consider requirements such as projectors, computers, accessibility, and power outlets.
- **Schedule Conflict Checks:** Check recorded class schedules and event timings for potential overlaps.
- **Ranked Recommendations:** Compare suitable rooms using a rule-based scoring approach.
- **Room Analytics:** Explore room distribution and space-usage information derived from the available dataset.

## 📊 Dataset

The project uses the synthetic dataset provided for the VIT-AP DATATHON 2026 Education Track.

| Dataset file | Description |
|---|---|
| `rooms.csv` | 120 room profiles |
| `class_schedule.csv` | 5,000 class schedule records |
| `room_requests.csv` | 5,000 historical room requests |
| `events.csv` | 1,800 event records |
| `README.txt` | Dataset documentation |

Room information is connected to class schedules and events using `room_id`. Historical room requests are used to understand demand and are not automatically treated as confirmed bookings.

## ⚙️ How It Works

1. Load and process the provided CSV datasets.
2. Collect the user's room requirements.
3. Filter rooms based on capacity and required facilities.
4. Check recorded schedules and events for potential time conflicts.
5. Rank suitable rooms and display recommendations with explanations.
6. Present relevant room and utilization analytics.

The prototype uses a **rule-based recommendation algorithm**. It does not claim to use a trained machine-learning model.

## 🛠️ Technology

- **Frontend:** React and TypeScript (as applicable to the current implementation)
- **Data source:** CSV datasets
- **Recommendation approach:** Rule-based filtering and ranking
- **Visualization:** Room and space-usage analytics

## 🚀 Project Status

CampusSpace AI is a prototype developed for the VIT-AP DATATHON 2026 Education Track. Its purpose is to demonstrate how structured campus data can support room discovery and more informed space allocation.

## ⚠️ Limitations

- The supplied dataset is synthetic and may not represent live campus conditions.
- Availability estimates depend on the schedule and event records available to the application.
- The prototype does not guarantee real-time room availability or confirm bookings.

## 🔮 Future Enhancements

- Integration with live campus timetables and room availability.
- A room-booking and approval workflow.
- Improved utilization analysis and demand forecasting.
- Integration with campus management systems.

## 👥 Contributors

Developed as a student project for **VIT-AP DATATHON 2026 — Track 2: Education**.
