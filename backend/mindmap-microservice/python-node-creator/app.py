from flask import Flask, request, jsonify
import logging
import re

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Sample categorization function
@app.route('/categorize', methods=['POST'])
def categorize_text():
    try:
        # Log the raw incoming request body for debugging
        app.logger.debug(f"Raw request data: {request.data}")
        
        # Try to parse the JSON data
        try:
            data = request.json
        except Exception as e:
            app.logger.error(f"Failed to parse JSON: {str(e)}")
            return jsonify({"error": "Invalid JSON format"}), 400
        
        # Check if the data is empty
        if not data:
            app.logger.error("No JSON data received.")
            return jsonify({"error": "No JSON data received"}), 400
        
        # If 'elements' or 'pages' are present, use that as the data list
        elements = data.get('elements', [])
        if not elements:
            app.logger.error("No elements found in the data.")
            return jsonify({"error": "No elements found"}), 400
        
        # Initialize variables for categorization
        structured_content = []
        current_h1 = None
        current_h2 = None
        current_h3 = None

        for element in elements:
            try:
                # Check if element is a dictionary
                if not isinstance(element, dict):
                    app.logger.error(f"Expected dictionary, but got {type(element)}: {element}")
                    continue  # Skip this element if it's not a dictionary

                # Log element details for debugging
                app.logger.debug(f"Processing element: {element}")

                # Check if the element is an H1 or H2 or P using Path and categorize accordingly
                if re.match(r'//Document/H1', element.get('Path', '')):
                    current_h1 = {'H1': element.get('Text', ''), 'subtopics': []}
                    structured_content.append(current_h1)
                    current_h2 = None
                    current_h3 = None  

                elif re.match(r'//Document/H2', element.get('Path', '')) and current_h1:
                    current_h2 = {'H2': element.get('Text', ''), 'subsubtopics': []}
                    current_h1['subtopics'].append(current_h2)
                    current_h3 = None  

                elif re.match(r'//Document/H3', element.get('Path', '')) and current_h2:
                    current_h3 = {'H3': element.get('Text', ''), 'paragraphs': []}
                    current_h2['subsubtopics'].append(current_h3)

                elif re.match(r'//Document/P', element.get('Path', '')):
                    if current_h3:
                        current_h3['paragraphs'].append(element.get('Text', ''))
                    elif current_h2:
                        current_h2.setdefault('paragraphs', []).append(element.get('Text', ''))

            except KeyError as e:
                app.logger.error(f"KeyError: Missing key {e} in element {element}")
                return jsonify({"error": f"Missing key: {e} in data"}), 400

        # Return the structured content as a JSON response
        return jsonify(structured_content)

    except Exception as e:
        # Log the error details
        app.logger.error(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
