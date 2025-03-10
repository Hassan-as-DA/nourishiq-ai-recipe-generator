# Creativity and Artificial Intelligence Seminar [EN] PoC Demo

## System Requirements

### Hardware Requirements
- **Processor**: Minimum dual-core CPU (recommended: quad-core or higher).
- **RAM**: Minimum 8 GB (recommended: 16 GB or higher for optimal performance).
- **Storage**: At least 10 GB of free disk space.
- **GPU**: Optional, but recommended for AI model inference acceleration.

### Software Requirements
- **Operating System**: Windows 10/11, macOS 11 or later, or Linux (Ubuntu 20.04 or later recommended).
- **Python**: Version 3.8 or higher.
- **Package Manager**: `pip` (comes with Python) or `conda` (optional).
- **Virtual Environment Tool**: `venv` or `virtualenv`.
- **Ollama CLI**: Required for running the Mistral model locally.

## Prerequisites

### 1. Install Python
- Check if Python is already installed:
    ```bash
    python --version
    ```
    Ensure the version is 3.8 or higher. If Python is not installed or the version is below 3.8, proceed with the steps below.

- Download and install Python 3.8 or higher from [python.org](https://www.python.org/downloads/).

- Verify installation:
    ```bash
    python --version
    ```

### 2. Install Ollama
- Download and install Ollama from [Ollama's official website](https://ollama.ai/).
- Verify the installation by running the below command on terminal:
    ```bash
    ollama --version
    ```
    Ensure the command outputs the installed version of Ollama CLI.

### 3. Clone the Repository
- Clone the project repository:
    ```bash
    git clone git@collaborating.tuhh.de:cfw0791/creativity-and-ai-seminar-demo.git
    cd creativity-and-ai-seminar-demo
    ```

### 4. Set Up Virtual Environment
- Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On macOS/Linux
    venv\Scripts\activate     # On Windows
    ```

### 5. Install Dependencies
- Install required Python packages:
    ```bash
    pip install -r backend/requirements.txt
    ```

### 6. Pull and Run the Ollama Mistral Model

Download and run [Mistral Model](https://ollama.com/library/mistral).

### 6. Pull and Run the Ollama Mistral Model

- Start the Ollama server:
    ```bash
    ollama serve
    ```

- Use Ollama CLI to pull the Mistral model:
    ```bash
    ollama pull mistral
    ```

- Verify the model is available:
    ```bash
    ollama list
    ```
    Ensure the output lists the Mistral model.

---

## Steps to Run the Application

#### 1. Ensure Virtual Environment is Active
- Verify that the virtual environment is activated.

#### 2. Navigate to the Application Directory
- Ensure you are in the root directory `creativity-and-ai-seminar-demo`.

#### 3. Start the Backend Application
- Run the backend application using `uvicorn` from the root directory:
    ```bash
    uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
    ```
- The application will be running when you see the message:
    ```
    INFO: Application startup complete.
    ```

#### 4. Run the Frontend Application
- Open a new terminal window.
- Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
- Install dependencies (only required once):
    ```bash
    npm install
    ```
    - **To install npm**:
        - On macOS/Linux: Install Node.js from [Node.js official website](https://nodejs.org/) or use a package manager like `brew` (macOS) or `apt` (Linux).
        - On Windows: Download and install Node.js from [Node.js official website](https://nodejs.org/), which includes npm.

- Build the frontend application (only required once):
    ```bash
    npm run build
    ```

- Start the frontend application:
    ```bash
    npm start
    ```
- Access the application UI at [http://localhost:3000](http://localhost:3000).

## Cleanup

- To stop the application, press `Ctrl+C` in the terminals where the frontend and backend applications are running.

- Check if if the `mistral` model is still running in Ollama:
    ```bash
    ollama ps
    ```
    Ensure the output lists no active models.

- If the mistral model is running stop it using:
    ```bash
    ollama stop mistral
    ```
---

## Notes
- Ensure all dependencies are installed and the environment is correctly set up before running the application.
- For optimal performance, use a machine with sufficient hardware resources, especially when working with large AI models.
