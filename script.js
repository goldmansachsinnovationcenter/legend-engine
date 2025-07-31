
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeSearch();
    
    initializeFilters();
    
    initializeCategoryNavigation();
    
    initializeDatasetInteractions();
    
    addLoadingAnimations();
    
    initializeBackdrop();
}

function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        searchInput.addEventListener('input', debounce(handleSearchInput, 300));
        
        searchBtn.addEventListener('click', function() {
            showBackdrop();
            handleSearchSubmit();
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                showBackdrop();
                handleSearchSubmit();
            }
        });
    }
}

function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    if (query.length > 2) {
        showSearchSuggestions(query);
    } else {
        hideSearchSuggestions();
    }
}

function handleSearchSubmit() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.trim();
    
    if (query) {
        performSearch(query);
    }
}

function showSearchSuggestions(query) {
    const existingSuggestions = document.querySelector('.search-suggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }
    
    const suggestions = [
        'Market Data',
        'Customer Transactions',
        'Risk Analytics',
        'Financial Reports',
        'Trading Volumes'
    ].filter(item => item.toLowerCase().includes(query.toLowerCase()));
    
    if (suggestions.length === 0) return;
    
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        
        item.addEventListener('click', function() {
            document.querySelector('.search-input').value = suggestion;
            hideSearchSuggestions();
            showBackdrop();
            performSearch(suggestion);
        });
        
        suggestionsContainer.appendChild(item);
    });
    
    const searchBox = document.querySelector('.search-box');
    searchBox.parentNode.insertBefore(suggestionsContainer, searchBox.nextSibling);
}

function hideSearchSuggestions() {
    const suggestions = document.querySelector('.search-suggestions');
    if (suggestions) {
        suggestions.remove();
    }
}

function performSearch(query) {
    const searchBtn = document.querySelector('.search-btn');
    const originalText = searchBtn.textContent;
    searchBtn.textContent = 'Searching...';
    searchBtn.disabled = true;
    
    setTimeout(() => {
        searchBtn.textContent = originalText;
        searchBtn.disabled = false;
        hideBackdrop();
        
        showSearchResults(query);
    }, 1000);
}

function showSearchResults(query) {
    const mockResults = [
        {
            title: 'Global Market Prices',
            type: 'Dataset',
            description: 'Real-time and historical market data including equity prices, forex rates, and commodity prices.',
            tags: ['Market Data', 'Real-time'],
            quality: 92
        },
        {
            title: 'Customer Transactions',
            type: 'Table',
            description: 'Comprehensive transaction history including trade details, settlements, and customer interactions.',
            tags: ['Customer Data', 'Transactions'],
            quality: 88
        },
        {
            title: 'Risk Analytics Dashboard',
            type: 'Report',
            description: 'Daily risk metrics and analytics including VaR calculations, stress test results, and portfolio exposures.',
            tags: ['Risk Data', 'Analytics'],
            quality: 95
        }
    ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    const datasetGrid = document.querySelector('.dataset-grid');
    
    if (datasetGrid) {
        datasetGrid.innerHTML = '';
        
        if (mockResults.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <div class="no-results-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No results found</h3>
                <p>We couldn't find any datasets matching "${query}"</p>
                <button class="btn btn-outline">Clear Search</button>
            `;
            datasetGrid.appendChild(noResults);
            
            datasetGrid.querySelector('.btn').addEventListener('click', function() {
                document.querySelector('.search-input').value = '';
                initializeDatasetDisplay();
            });
        } else {
            mockResults.forEach(result => {
                const card = createDatasetCard(result);
                datasetGrid.appendChild(card);
            });
        }
        
        const sectionTitle = document.querySelector('.featured-section .section-title');
        if (sectionTitle) {
            sectionTitle.textContent = `Search Results for "${query}"`;
        }
    }
}

function initializeFilters() {
    const filterChips = document.querySelectorAll('.filter-chip');
    const categoryLinks = document.querySelectorAll('.category-link');
    const sourceCheckboxes = document.querySelectorAll('.source-item input[type="checkbox"]');
    
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            showBackdrop();
            
            filterChips.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            
            applyTypeFilter(this.textContent.trim());
            
            setTimeout(() => {
                hideBackdrop();
            }, 500);
        });
    });
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showBackdrop();
            
            categoryLinks.forEach(l => l.classList.remove('active'));
            
            this.classList.add('active');
            
            const category = this.textContent.trim().split('\n')[0];
            applyCategoryFilter(category);
            
            setTimeout(() => {
                hideBackdrop();
            }, 500);
        });
    });
    
    sourceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            showBackdrop();
            applySourceFilter();
            setTimeout(() => {
                hideBackdrop();
            }, 500);
        });
    });
}

function applyTypeFilter(type) {
    const datasetGrid = document.querySelector('.dataset-grid');
    
    if (datasetGrid) {
        const cards = datasetGrid.querySelectorAll('.dataset-card');
        
        cards.forEach(card => {
            const cardType = card.querySelector('.dataset-type').textContent.trim();
            
            if (type === 'All' || cardType.includes(type)) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        });
        
        const sectionTitle = document.querySelector('.featured-section .section-title');
        if (sectionTitle) {
            sectionTitle.textContent = type === 'All' ? 'Featured Datasets' : `${type} Results`;
        }
    }
}

function applyCategoryFilter(category) {
    const datasetGrid = document.querySelector('.dataset-grid');
    
    if (datasetGrid) {
        const cards = datasetGrid.querySelectorAll('.dataset-card');
        
        cards.forEach(card => {
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.trim());
            
            if (tags.includes(category) || category === 'Financial Data') {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        });
        
        const sectionTitle = document.querySelector('.featured-section .section-title');
        if (sectionTitle) {
            sectionTitle.textContent = `${category} Datasets`;
        }
    }
}

function applySourceFilter() {
    const checkedSources = Array.from(document.querySelectorAll('.source-item input:checked'))
        .map(checkbox => checkbox.parentElement.textContent.trim());
    
    const datasetGrid = document.querySelector('.dataset-grid');
    
    if (datasetGrid) {
        const cards = datasetGrid.querySelectorAll('.dataset-card');
        
        if (checkedSources.length === 0) {
            cards.forEach(card => {
                card.style.display = 'block';
                card.classList.add('fade-in');
            });
        } else {
            cards.forEach(card => {
                const randomMatch = Math.random() > 0.5;
                
                if (randomMatch) {
                    card.style.display = 'block';
                    card.classList.add('fade-in');
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        const sectionTitle = document.querySelector('.featured-section .section-title');
        if (sectionTitle && checkedSources.length > 0) {
            sectionTitle.textContent = `Filtered Datasets (${checkedSources.join(', ')})`;
        } else if (sectionTitle) {
            sectionTitle.textContent = 'Featured Datasets';
        }
    }
}

function initializeCategoryNavigation() {
    const categoryLinks = document.querySelectorAll('.category-link');
    
    categoryLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(4px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
}

function initializeDatasetInteractions() {
    initializeDatasetDisplay();
    
    initializeActionButtons();
    
    initializeViewButtons();
}

function initializeDatasetDisplay() {
    const datasetCards = document.querySelectorAll('.dataset-card');
    
    datasetCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.action-btn')) {
                showBackdrop();
                openDatasetDetails(this);
            }
        });
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initializeActionButtons() {
    const actionBtns = document.querySelectorAll('.action-btn');
    
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const isBookmark = this.querySelector('i').classList.contains('fa-bookmark');
            
            if (isBookmark) {
                const icon = this.querySelector('i');
                if (icon.classList.contains('fas')) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    showToast('Removed from bookmarks');
                } else {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    showToast('Added to bookmarks');
                }
            } else {
                showShareDialog(this.closest('.dataset-card'));
            }
        });
    });
}

function initializeViewButtons() {
    const viewBtns = document.querySelectorAll('.recent-actions .btn');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const item = this.closest('.recent-item');
            const title = item.querySelector('.recent-title').textContent;
            
            showBackdrop();
            openDatasetDetails({
                querySelector: () => ({
                    textContent: title
                })
            });
        });
    });
}

function openDatasetDetails(card) {
    const title = card.querySelector('.dataset-title')?.textContent || 
                 card.querySelector('.recent-title')?.textContent || 
                 'Dataset Details';
    
    const modal = document.createElement('div');
    modal.className = 'dataset-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading dataset details...</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-btn').addEventListener('click', function() {
        modal.remove();
        hideBackdrop();
    });
    
    setTimeout(() => {
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="dataset-details">
                <div class="details-section">
                    <h3>Overview</h3>
                    <p>This dataset contains comprehensive information related to ${title.toLowerCase()}. It is updated daily and maintained by the Data Management team.</p>
                    
                    <div class="details-meta">
                        <div class="meta-item">
                            <span class="meta-label">Owner:</span>
                            <span class="meta-value">Data Management Team</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Last Updated:</span>
                            <span class="meta-value">Today, 09:45 AM</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Format:</span>
                            <span class="meta-value">CSV, Parquet</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Size:</span>
                            <span class="meta-value">2.4 GB</span>
                        </div>
                    </div>
                </div>
                
                <div class="details-section">
                    <h3>Schema</h3>
                    <div class="schema-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Column</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>id</td>
                                    <td>string</td>
                                    <td>Unique identifier</td>
                                </tr>
                                <tr>
                                    <td>timestamp</td>
                                    <td>datetime</td>
                                    <td>Record creation time</td>
                                </tr>
                                <tr>
                                    <td>value</td>
                                    <td>decimal</td>
                                    <td>Primary value</td>
                                </tr>
                                <tr>
                                    <td>category</td>
                                    <td>string</td>
                                    <td>Classification category</td>
                                </tr>
                                <tr>
                                    <td>status</td>
                                    <td>string</td>
                                    <td>Current status</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="details-section">
                    <h3>Access</h3>
                    <div class="access-options">
                        <button class="btn btn-primary">
                            <i class="fas fa-download"></i>
                            Download
                        </button>
                        <button class="btn btn-outline">
                            <i class="fas fa-code"></i>
                            API Access
                        </button>
                        <button class="btn btn-outline">
                            <i class="fas fa-table"></i>
                            Query in SQL
                        </button>
                    </div>
                    
                    <div class="access-code">
                        <h4>Sample Code</h4>
                        <pre><code>// Python example
import pandas as pd

# Load the dataset
df = pd.read_csv('s3://data-catalog/${title.replace(/\s+/g, '-').toLowerCase()}/latest.csv')

# Display first 5 rows
print(df.head())</code></pre>
                    </div>
                </div>
                
                <div class="details-section">
                    <h3>Lineage</h3>
                    <div class="lineage-diagram">
                        <div class="lineage-node source">
                            <i class="fas fa-database"></i>
                            <span>Source System</span>
                        </div>
                        <div class="lineage-arrow">
                            <i class="fas fa-long-arrow-alt-right"></i>
                        </div>
                        <div class="lineage-node transform">
                            <i class="fas fa-cogs"></i>
                            <span>ETL Process</span>
                        </div>
                        <div class="lineage-arrow">
                            <i class="fas fa-long-arrow-alt-right"></i>
                        </div>
                        <div class="lineage-node current">
                            <i class="fas fa-table"></i>
                            <span>${title}</span>
                        </div>
                        <div class="lineage-arrow">
                            <i class="fas fa-long-arrow-alt-right"></i>
                        </div>
                        <div class="lineage-node downstream">
                            <i class="fas fa-chart-bar"></i>
                            <span>Reports</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function() {
                showToast(`Action triggered: ${this.textContent.trim()}`);
            });
        });
    }, 1500);
}

function showShareDialog(card) {
    const title = card.querySelector('.dataset-title').textContent;
    
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Share Dataset</h2>
                <button class="close-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <p>Share "${title}" with your colleagues</p>
                
                <div class="share-options">
                    <div class="share-option">
                        <i class="fas fa-envelope"></i>
                        <span>Email</span>
                    </div>
                    <div class="share-option">
                        <i class="fas fa-link"></i>
                        <span>Copy Link</span>
                    </div>
                    <div class="share-option">
                        <i class="fas fa-file-export"></i>
                        <span>Export</span>
                    </div>
                </div>
                
                <div class="share-link-container">
                    <input type="text" value="https://data-catalog.goldmansachs.com/datasets/${title.replace(/\s+/g, '-').toLowerCase()}" readonly>
                    <button class="btn btn-sm">Copy</button>
                </div>
                
                <div class="share-permissions">
                    <h4>Permissions</h4>
                    <div class="permission-option">
                        <input type="radio" name="permission" id="view-only" checked>
                        <label for="view-only">View only</label>
                    </div>
                    <div class="permission-option">
                        <input type="radio" name="permission" id="edit">
                        <label for="edit">Edit</label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline">Cancel</button>
                <button class="btn btn-primary">Share</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    showBackdrop();
    
    modal.querySelector('.close-btn').addEventListener('click', function() {
        modal.remove();
        hideBackdrop();
    });
    
    modal.querySelector('.modal-footer .btn-outline').addEventListener('click', function() {
        modal.remove();
        hideBackdrop();
    });
    
    modal.querySelector('.modal-footer .btn-primary').addEventListener('click', function() {
        modal.remove();
        hideBackdrop();
        showToast('Dataset shared successfully');
    });
    
    modal.querySelector('.share-link-container .btn').addEventListener('click', function() {
        const input = modal.querySelector('.share-link-container input');
        input.select();
        document.execCommand('copy');
        this.textContent = 'Copied!';
        setTimeout(() => {
            this.textContent = 'Copy';
        }, 2000);
    });
    
    modal.querySelectorAll('.share-option').forEach(option => {
        option.addEventListener('click', function() {
            const method = this.querySelector('span').textContent;
            showToast(`Sharing via ${method}`);
        });
    });
}

function addLoadingAnimations() {
    const elements = [
        '.hero-content',
        '.stats-grid',
        '.sidebar',
        '.content-area'
    ];
    
    elements.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
            setTimeout(() => {
                element.classList.add('fade-in');
            }, index * 100);
        }
    });
}

function initializeBackdrop() {
    if (!document.querySelector('.backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'backdrop';
        document.body.appendChild(backdrop);
        
        backdrop.addEventListener('click', function() {
            const modals = document.querySelectorAll('.dataset-modal, .share-modal');
            modals.forEach(modal => modal.remove());
            
            hideBackdrop();
        });
    }
    
    if (!document.querySelector('#backdrop-styles')) {
        const style = document.createElement('style');
        style.id = 'backdrop-styles';
        style.textContent = `
            .backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999;
                display: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .backdrop.active {
                display: block;
                opacity: 1;
            }
            
            .dataset-modal,
            .share-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-content {
                padding: 1.5rem;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .modal-header h2 {
                font-size: 1.5rem;
                font-weight: 600;
                color: #1a202c;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: #64748b;
                cursor: pointer;
                font-size: 1.25rem;
                padding: 0.5rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .close-btn:hover {
                background: #f1f5f9;
                color: #0066cc;
            }
            
            .modal-body {
                margin-bottom: 1.5rem;
            }
            
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                padding-top: 1rem;
                border-top: 1px solid #e2e8f0;
            }
            
            .loading-spinner {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 3rem 0;
                color: #64748b;
            }
            
            .loading-spinner i {
                font-size: 2rem;
                margin-bottom: 1rem;
                color: #0066cc;
            }
            
            .dataset-details {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }
            
            .details-section h3 {
                font-size: 1.25rem;
                font-weight: 600;
                color: #1a202c;
                margin-bottom: 1rem;
            }
            
            .details-meta {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .meta-item {
                background: #f8fafc;
                padding: 0.75rem;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            
            .meta-label {
                display: block;
                font-size: 0.75rem;
                color: #64748b;
                margin-bottom: 0.25rem;
            }
            
            .meta-value {
                font-weight: 500;
                color: #1a202c;
            }
            
            .schema-table {
                overflow-x: auto;
                margin-top: 1rem;
            }
            
            .schema-table table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .schema-table th,
            .schema-table td {
                padding: 0.75rem;
                text-align: left;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .schema-table th {
                background: #f8fafc;
                font-weight: 600;
                color: #1a202c;
            }
            
            .access-options {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
                flex-wrap: wrap;
            }
            
            .btn-primary {
                background: #0066cc;
                color: white;
            }
            
            .btn-primary:hover {
                background: #0052a3;
            }
            
            .access-code {
                background: #1a202c;
                color: #e2e8f0;
                padding: 1rem;
                border-radius: 8px;
                overflow-x: auto;
            }
            
            .access-code h4 {
                color: #a0aec0;
                margin-bottom: 0.5rem;
                font-size: 0.875rem;
            }
            
            .access-code pre {
                margin: 0;
                font-family: monospace;
                line-height: 1.5;
            }
            
            .lineage-diagram {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 1rem;
                overflow-x: auto;
                padding: 1rem 0;
            }
            
            .lineage-node {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                padding: 1rem;
                border-radius: 8px;
                min-width: 120px;
                text-align: center;
            }
            
            .lineage-node i {
                font-size: 1.5rem;
            }
            
            .lineage-node span {
                font-size: 0.875rem;
                font-weight: 500;
            }
            
            .lineage-node.source {
                background: #f0f9ff;
                color: #0066cc;
            }
            
            .lineage-node.transform {
                background: #f0fdf4;
                color: #059669;
            }
            
            .lineage-node.current {
                background: #eff6ff;
                color: #3b82f6;
                border: 2px solid #3b82f6;
            }
            
            .lineage-node.downstream {
                background: #fef2f2;
                color: #dc2626;
            }
            
            .lineage-arrow {
                color: #64748b;
                font-size: 1.25rem;
                flex-shrink: 0;
            }
            
            .share-options {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin: 2rem 0;
            }
            
            .share-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                padding: 1rem;
                border-radius: 8px;
                transition: all 0.2s ease;
            }
            
            .share-option:hover {
                background: #f8fafc;
            }
            
            .share-option i {
                font-size: 1.5rem;
                color: #0066cc;
                background: #eff6ff;
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .share-link-container {
                display: flex;
                margin: 1.5rem 0;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .share-link-container input {
                flex: 1;
                padding: 0.75rem;
                border: none;
                outline: none;
                font-size: 0.875rem;
                color: #1a202c;
                background: #f8fafc;
            }
            
            .share-link-container .btn {
                border-radius: 0;
                padding: 0.75rem 1.5rem;
            }
            
            .share-permissions {
                margin-top: 1.5rem;
            }
            
            .share-permissions h4 {
                font-size: 1rem;
                font-weight: 600;
                color: #1a202c;
                margin-bottom: 0.75rem;
            }
            
            .permission-option {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }
            
            .permission-option label {
                cursor: pointer;
            }
            
            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border-radius: 0 0 12px 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                z-index: 10;
                margin-top: -0.5rem;
                overflow: hidden;
            }
            
            .suggestion-item {
                padding: 0.75rem 1rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .suggestion-item:hover {
                background: #f8fafc;
                color: #0066cc;
            }
            
            .toast {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: #1a202c;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                z-index: 1001;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }
            
            .toast.active {
                opacity: 1;
                transform: translateY(0);
            }
            
            .no-results {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 3rem 0;
                text-align: center;
                grid-column: 1 / -1;
            }
            
            .no-results-icon {
                font-size: 3rem;
                color: #e2e8f0;
                margin-bottom: 1rem;
            }
            
            .no-results h3 {
                font-size: 1.5rem;
                font-weight: 600;
                color: #1a202c;
                margin-bottom: 0.5rem;
            }
            
            .no-results p {
                color: #64748b;
                margin-bottom: 1.5rem;
            }
            
            @media (max-width: 768px) {
                .dataset-modal,
                .share-modal {
                    width: 95%;
                }
                
                .share-options {
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .share-option {
                    flex-direction: row;
                    justify-content: flex-start;
                    width: 100%;
                }
                
                .lineage-diagram {
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .lineage-arrow {
                    transform: rotate(90deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                background: #1a202c;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                z-index: 1001;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }
            
            .toast.active {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
}

function showBackdrop() {
    const backdrop = document.querySelector('.backdrop');
    if (backdrop) {
        backdrop.classList.add('active');
    }
}

function hideBackdrop() {
    const backdrop = document.querySelector('.backdrop');
    if (backdrop) {
        backdrop.classList.remove('active');
    }
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('active');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('active');
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function createDatasetCard(data) {
    const card = document.createElement('div');
    card.className = 'dataset-card';
    
    if (data.quality > 90) {
        card.classList.add('featured');
    }
    
    card.innerHTML = `
        <div class="card-header">
            <div class="dataset-type">
                <i class="fas fa-${data.type === 'Dataset' ? 'database' : data.type === 'Table' ? 'table' : 'chart-line'}"></i>
                ${data.type}
            </div>
            <div class="card-actions">
                <button class="action-btn">
                    <i class="far fa-bookmark"></i>
                </button>
                <button class="action-btn">
                    <i class="fas fa-share"></i>
                </button>
            </div>
        </div>
        <div class="card-content">
            <h3 class="dataset-title">${data.title}</h3>
            <p class="dataset-description">${data.description}</p>
            <div class="dataset-meta">
                <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    Updated daily
                </span>
                <span class="meta-item">
                    <i class="fas fa-eye"></i>
                    ${Math.floor(Math.random() * 1000) + 100} views
                </span>
            </div>
        </div>
        <div class="card-footer">
            <div class="tags">
                ${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="quality-score">
                <span class="score-label">Quality:</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${data.quality}%"></div>
                </div>
                <span class="score-value">${data.quality}%</span>
            </div>
        </div>
    `;
    
    return card;
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}
