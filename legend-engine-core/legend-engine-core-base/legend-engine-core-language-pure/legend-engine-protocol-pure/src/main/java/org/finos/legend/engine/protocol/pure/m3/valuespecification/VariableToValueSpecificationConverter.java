// Copyright 2025 Goldman Sachs
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package org.finos.legend.engine.protocol.pure.m3.valuespecification;

import org.finos.legend.engine.protocol.pure.m3.type.generics.GenericType;
import org.finos.legend.engine.protocol.pure.m3.valuespecification.raw.ClassInstance;
import org.finos.legend.engine.protocol.pure.m3.multiplicity.Multiplicity;

/**
 * Utility class for converting Variable and GenericType objects to ValueSpecification
 */
public class VariableToValueSpecificationConverter
{
    /**
     * Convert a Variable to a ValueSpecification
     * Since Variable already extends ValueSpecification, this is a simple cast
     *
     * @param variable the Variable to convert
     * @return the Variable as a ValueSpecification
     */
    public static ValueSpecification convertVariableToValueSpecification(Variable variable)
    {
        // Since Variable already extends ValueSpecification, simply return it
        return variable;
    }
    
    /**
     * Convert a GenericType to a ValueSpecification
     * Creates a ClassInstance as a ValueSpecification representation of the GenericType
     *
     * @param genericType the GenericType to convert
     * @return a ClassInstance representing the GenericType
     */
    public static ValueSpecification convertGenericTypeToValueSpecification(GenericType genericType)
    {
        // Create a ClassInstance as a ValueSpecification representation
        ClassInstance classInstance = new ClassInstance();
        classInstance._type = "classInstance";
        classInstance.type = genericType.rawType.getPath();
        
        Multiplicity multiplicity = new Multiplicity();
        multiplicity.lowerBound = 1;
        multiplicity.upperBound = 1;
        classInstance.multiplicity = multiplicity;
        
        return classInstance;
    }
}
