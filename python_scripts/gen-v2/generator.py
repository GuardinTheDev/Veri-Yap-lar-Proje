from faker import Faker
import json
import os
import math
import random
import matplotlib.pyplot as plt
import numpy as np
from itertools import product
import networkx as nx #networkx is for displaying graph
import string
import copy

fakegen = Faker()

def euclideanDistance(a,b):
    return math.sqrt(math.pow(a[0]-b[0],2) + math.pow(a[1]-b[1],2))

class WeightedTransitGraph():
    AutoIntegrityCheck = False

    def __init__(self):
        self.nodeList = []
        self.lineList = []

    class Exceptions():
        class InvalidOperation(Exception):
            def __init__(self, message):
                self.message = message
                super().__init__(self.message)

    class TransitNodeConnection():
        def __init__(self, line, weight, node):
            self.line = line
            self.weight = weight
            self.connectedNode = node

    class TransitStopNode():
        def __init__(self, name, X, Y, parentGraph: WeightedTransitGraph) -> None:
            self.name = name
            self.parentGraph = parentGraph
            self.connectedNodes = []
            self.X = X
            self.Y = Y
            self.parentGraph.nodeList.append(self)
            self.id = parentGraph.nodeList.index(self)
        
        def modifyConnection(self):
            pass
            
        def connectNodeTo(self, nodeTo, weight, line):
            self.connectedNodes.append(WeightedTransitGraph.TransitNodeConnection(line, weight, nodeTo))
        
        def getNearestNode():
            pass
    
    class TransitLine():

        class TransitLineTypes():
            class BaseLineType(): pass

            class CircularLine(BaseLineType): pass
            class InvalidLine(BaseLineType): pass
            class LinearLine(BaseLineType): pass

        def __init__(self, name: str, parentGraph: WeightedTransitGraph):
            self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.LinearLine
            self.name = name
            self.lineNodeList = [] 
            self.parentGraph = parentGraph
            self.initialNode = None # id=0 is usually the initial node
            self.id = len(parentGraph.lineList)
            parentGraph.lineList.append(self)
        

        class LineStopNode():
            def __init__(self, parentList: WeightedTransitGraph.TransitLine, GraphNode: WeightedTransitGraph.TransitStopNode):
                self.nextNode = None
                self.globalID = GraphNode.id
                self.parentList = parentList
                self.id = self.parentList.lineNodeList.__len__()
                self.parentList.lineNodeList.append(self)
                self.TransitNode = GraphNode
                self.nextWeight = None
                
                
            def getPreviousNode(self):
                for x in self.parentList.lineNodeList:
                    if x.nextNode == self:
                        return x
                    else:
                        # print("No previous node")
                        return None
                    
        def addNode(self, GraphNode: WeightedTransitGraph.TransitStopNode, weight, previousNode=None, nextWeight=None):
            if previousNode is None:
                if self.lineNodeList.__len__() == 0:
                    lineNode = self.LineStopNode(self, GraphNode)
                    self.setInitialNode(lineNode)
                    return lineNode
                else: lineNode = self.LineStopNode(self, GraphNode)

            else:
                if type(previousNode) is WeightedTransitGraph.TransitLine.LineStopNode:
                    next = previousNode.nextNode 
                    node = self.LineStopNode(self, GraphNode)
                    previousNode.nextNode = node
                    node.nextNode = next
                    previousNode.nextWeight = weight
                    previousNode.TransitNode.connectNodeTo(node.TransitNode, weight, self)
                    print(f"connected nodes: {previousNode.TransitNode.connectedNodes}")
                    if next is not None:
                        for connection in previousNode.TransitNode.connectedNodes:
                            if connection.line is self:
                                if connection.node is next:
                                    previousNode.TransitNode.connectedNodes.remove(connection)
                        node.TransitNode.connectNodeTo(next.TransitNode, weight, self)
                    return node
                elif type(previousNode) is WeightedTransitGraph.TransitStopNode:
                    return self.addNode(GraphNode, weight, self.convertTransitNodeToLineNode(previousNode), nextWeight)
                else:
                    raise(ValueError)
        
        def getLastNode(self):
            if self.lineType is self.TransitLineTypes.CircularLine:
                return self.initialNode
            node = self.initialNode
            while True:
                if node.nextNode is not None:
                    node = node.nextNode
                else:
                    return node
        
        def setInitialNode(self, node: LineStopNode):
            if node.getPreviousNode() is not None:
                if self.lineType is self.TransitLineTypes.LinearLine:
                    raise(WeightedTransitGraph.Exceptions.InvalidOperation("Cannot change initial node on a linear line"))
                elif self.lineType is self.TransitLineTypes.CircularLine:
                    self.initialNode = node
            else:
                try: self.lineNodeList.index(node)
                except ValueError:
                    raise(IndexError)
                    return
                self.initialNode = node


        def getNodeById(self, id):
            return self.nodeList[id]

        def removeNode(self, targetNode: LineStopNode):
            next = targetNode.nextNode
            prev = targetNode.getPreviousNode()
            if self.initialNode == targetNode:
                self.initialNode = next
            if prev is not None:
                prev.setNextNode = next
                self.nodeList.pop(self.getNodeById(targetNode))
        
        def addReverseLine(self, line=None):
            if line is None:
                line = self
            stopList = copy.deepcopy(line.lineNodeList)
            stopList.reverse()
            newLine = self.parentGraph.addNewLine(line.name)
            for stop in stopList:
                newLine.addNode(stop.TransitNode, None)

            def __getPrev(stopList, x):
                for i in stopList:
                    try: 
                        if i.nextNode.globalID == x.globalID: return i
                    except: pass
                    

            stop: WeightedTransitGraph.TransitLine.LineStopNode
            for stop in newLine.lineNodeList:
                
                for x in stopList:
                    if x.globalID == stop.globalID:
                        prev = __getPrev(stopList, x)
                        try: 
                            prevID = prev.globalID
                            prevWeight = prev.nextWeight
                        except:
                            prevID = None
                            prevWeight = None

                        for h in newLine.lineNodeList:
                            if h.globalID == prevID:
                                stop.nextNode = h
                                stop.nextWeight = prevWeight

                        

            print("\n\n")
            return newLine

        def convertTransitNodeToLineNode(self, node: WeightedTransitGraph.TransitStopNode, line=None):
            lineNode: WeightedTransitGraph.TransitLine.LineStopNode
            if line is None:
                line = self
            for lineNode in line.lineNodeList:
                if lineNode.globalID == node.id:
                    return lineNode
            raise(IndexError)
        
        def checkIntegrity(self): # check if the linked list is valid
            if len(self.nodeList) == 0: 
                print("List empty")
                return
            
            visitedNodes = []
            iterations = 0
            node: WeightedTransitGraph.TransitLine.LineStopNode
            node = self.nodeList[0]
            iterations += 1
            visitedNodes.append(node)
            node = node.nextNode

            # traversal function
            while True:
                if node is None:
                    print("End of list")
                    self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.LinearLine
                    break

                if node == self.nodeList[0]:
                    print("reached initial node")
                    self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.CircularLine
                    break
                    
                if node in visitedNodes:
                    print("there is a loop inside")
                    self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.InvalidLine
                    break
                visitedNodes.append(node)
                iterations += 1
                node = node.nextNode

            if iterations != len(self.nodeList):
                self.lineType = WeightedTransitGraph.TransitLine.TransitLineTypes.InvalidLine
                print("invalid list")


    def addNewLine(self, name):
        newLine = self.TransitLine(name, self)
        return newLine

    def addNode(self, name, X, Y):
        node = self.TransitStopNode(name, X, Y, self)
        # self.nodeList.append(node)
        return node
    
    def getChildByName(self, name):
        i: WeightedTransitGraph.TransitStopNode
        for i in self.nodeList:
            if i.name == name:
                return(i)

    class _RandomGenerator():
        def __init__(self, faker, coordRange: range, parentGraph):
            # generate a square map
            if len(coordRange) != 2:
                raise(ValueError)
            for i in coordRange:
                if type(i) is not int:
                    raise(TypeError)
            self.coordRange = coordRange
            # self.stopList = []
            self.parentGraph = parentGraph
            self.faker = faker
        

        def generateStopCoordinates(self, faker:Faker, stopCount:int, minDist=0, maxDist=-1):

            @staticmethod
            def isFarEnough(minDist, list, coord:tuple):
                for i in list:
                    dist = euclideanDistance(i, coord)
                    if dist < minDist:
                        return False
                return True
            
            # lastIndex = len(self.stopList)

            # generate all unique tuple possibilities within range and sample stopCount of them
            #coordList = random.sample(list(product(range(self.coordRange[0], self.coordRange[1]), repeat=2)), k=stopCount)

            # manual sampling:
            allPossibleCoordinates = list(product(range(self.coordRange[0], self.coordRange[1]), repeat=2))
            #print(allPossibleCoordinates)
            # print(len(allPossibleCoordinates))
            if stopCount > len(allPossibleCoordinates): raise(ValueError) 
            # alternatively, use (abs(self.coordRange[1]-self.coordRange[0]))^2 which would return the same value
            # raise an exception if asked to sample more stops than possible

            @staticmethod
            def MaxDistCheck(maxDist, list):
                for x in list:
                    for i in list:
                        dist = euclideanDistance(i, x)
                        if dist > maxDist:
                            return False
                return True
            # max dist is kinda problematic, use at your own risk

            def sampleCoordinatesWithinDistance(stopCount, apc):
                allPossibleCoordinates = apc
                while True:
                    coordList = []
                    while True:
                        if len(allPossibleCoordinates)==0:
                            # raise(ValueError)
                            break
                        if len(coordList) == stopCount:
                            break
                        v: int
                        max = len(allPossibleCoordinates)-1
                        v = random.randint(0,max)
                        temp = allPossibleCoordinates.pop(v)
                        if isFarEnough(minDist, coordList, temp):
                            coordList.append(temp)
                    if maxDist != -1: # set maxDist to -1 to ignore max distance
                        if MaxDistCheck(maxDist, coordList):
                            return coordList
                    else:
                        return coordList
            
            coordList = sampleCoordinatesWithinDistance(stopCount, allPossibleCoordinates)

            for v in coordList:
                stopName = faker.street_address()
                #newStop = {
                #    "id": i+lastIndex,
                #    "name": stopName,
                #    "x": v[0],
                #    "y": v[1],
                #    "lines": None
                #}
                # self.stopList.append(newStop)

                self.parentGraph.addNode(name=stopName,X=v[0],Y=v[1])

        def generateLineName(self):
            # line name logic
            letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            numbers = "1234567890"
            lnlen = random.randint(2,4)
            lineName= ""
            if lnlen == 2:
                if random.randint(0,1)==1:
                    lineName+=random.choice(letters)
                    lineName+=random.choice(numbers)
                else:
                    lineName+=random.choice(numbers)
                    lineName+=random.choice(letters)
            elif lnlen==3:
                x = random.randint(0,2)
                if x ==0:
                    lineName+=random.choice(letters)
                    lineName+=random.choice(numbers)
                    lineName+=random.choice(numbers)
                elif x==1:
                    lineName+=random.choice(numbers)
                    lineName+=random.choice(letters)
                    lineName+=random.choice(letters)
                else:
                    lineName+=random.choice(numbers)
                    lineName+=random.choice(numbers)
                    lineName+=random.choice(letters)
            else:
                if random.randint(0,1)==1:
                    lineName+=random.choice(letters)
                    lineName+=random.choice(numbers)
                    lineName+=random.choice(numbers)
                    lineName+=random.choice(letters)
                else:
                    lineName+=random.choice(numbers)
                    lineName+=random.choice(numbers)
                    lineName+=random.choice(letters)
                    lineName+=random.choice(letters)
            return lineName
        
        def generateRandomLine(self, stopCount: int, speed: int, maxDist=-1, oneWay=False):
            graph = self.parentGraph
            list = copy.deepcopy(graph.nodeList)
            initialNode = list.pop(random.randint(0,len(list)-1))
            Line: WeightedTransitGraph.TransitLine

            lineName = self.generateLineName()
            Line = graph.addNewLine(lineName)
            Line.addNode(initialNode, None)
            Line.setInitialNode(Line.convertTransitNodeToLineNode(initialNode))
            currentNode = Line.convertTransitNodeToLineNode(initialNode)
            currentNode: WeightedTransitGraph.TransitLine.LineStopNode
            i = stopCount-1

            step = 10
            
            def _loop(maxDist, line, speed, list, currentNode, i):
                while True:
                    if len(list) == 0:
                        newList = []
                        for node in self.parentGraph:
                            try: line.convertTransitNodeToLineNode(node)
                            except: newList.append(node)
                                
                        _loop(maxDist+step, line, speed, newList, currentNode, i)
                        break

                    if type(currentNode) is not WeightedTransitGraph.TransitLine.LineStopNode: raise(TypeError)
                    if i == 0:
                        break
                    sel: WeightedTransitGraph.TransitStopNode
                    sel = list.pop(random.randint(0,len(list)-1))
                    dist = euclideanDistance((sel.X,sel.Y), (currentNode.TransitNode.X, currentNode.TransitNode.Y))
                    weight = dist/speed
                    if maxDist != -1:
                        if dist <= maxDist:
                            
                            line.addNode(sel, weight, currentNode)
                            i -= 1
                            currentNode = currentNode.nextNode
                        else: continue
                    else: 
                        line.addNode(sel, weight, currentNode)
                        i -= 1
                        currentNode = currentNode.nextNode
            _loop(maxDist, Line, speed, list, currentNode, i)
            if not oneWay:
                Line.addReverseLine()
            return Line
            # print(Line.lineNodeList)
        
        def plotStops(self):
            G = nx.MultiGraph()

            #fig = plt.figure()
            #plot1 = fig.add_subplot(1,1,1)
            x = []
            y = []
            txt = []
            pos = []

            #for stop in self.stopList:
            #    x.append(stop["x"])
            #    y.append(stop["y"])
            #    txt.append("ID:"+str(stop["id"]))
            #
            #    G.add_node(stop["id"])
            #    pos.insert(stop["id"], np.array([stop["x"],stop["y"]]))

            for node in self.parentGraph.nodeList:
                x.append(int(node.X))
                y.append(int(node.Y))
                txt.append(node.name)

                G.add_node(node.id)
                pos.insert(node.id, np.array([node.X,node.Y]))

            x = np.array(x)
            y = np.array(y)

            print(len(self.parentGraph.nodeList))
            #plot1.scatter(x,y)
            #for i, v in enumerate(txt):
            #    plot1.annotate(v, (x[i], y[i]))
            nx.draw(G, pos, with_labels=True)
            plt.show()
        
        def ensureLineConnection(self):
            pass

    def getRandomGenerator(self, faker, coordRange: range):
        rand = self._RandomGenerator(faker, coordRange, self)
        return rand
    
    def export(self):
        plainData = {"lines":{},"stops":{}}
        Line: WeightedTransitGraph.TransitLine
        for Line in self.lineList:
            linePlain = {}
            linePlain["name"] = Line.name
            node: WeightedTransitGraph.TransitLine.LineStopNode
            for node in Line.lineNodeList:
                if node.nextNode is None:
                    nodePlain = {
                    "globalID": node.globalID,
                    "next": None
                }
                else:
                    nodePlain = {
                        "globalID": node.globalID,
                        "next": node.nextNode.globalID,
                        "nextWeight": node.nextWeight
                    }
                linePlain[node.id] = nodePlain

            plainData["lines"][Line.id] = linePlain
        stop: WeightedTransitGraph.TransitStopNode
        lines = []
        for stop in self.nodeList:
            stopPlain = {
                "name": stop.name,
                "x": stop.X,
                "y": stop.Y,
            }
            plainData["stops"][stop.id] = stopPlain
        return plainData
    
    def clearEmptyNodes(self):
        for node in self.nodeList:
            line: WeightedTransitGraph.TransitLine
            incomingConnections = []
            outgoingConnections = []
            for line in self.lineList:
                x = None
                try: 
                    x = line.convertTransitNodeToLineNode(node)
                except IndexError:
                    continue
                if x.nextNode is not None:
                    outgoingConnections.append((x.nextNode.TransitNode, line.id))
                if x.getPreviousNode() != None:
                    incomingConnections.append((x.getPreviousNode().TransitNode, line.id))

            print(f"incoming connections for ID={node.id}: {len(incomingConnections)}")
            print(f"outgoing connections for ID={node.id}: {len(outgoingConnections)}")
            print("\n\n")
            if len(incomingConnections) == 0 and len(outgoingConnections) == 0:
                self.nodeList.remove(node)

    def normalizeID(self):
        v: WeightedTransitGraph.TransitStopNode
        for i, v in enumerate(self.nodeList):
            v.id = i

myGraph = WeightedTransitGraph()
gen = myGraph.getRandomGenerator(fakegen, (0,200))
gen.generateStopCoordinates(fakegen, 50, 20)
myLine = gen.generateRandomLine(5, 10)
myLine2 = gen.generateRandomLine(5, 10)
myLine3 = gen.generateRandomLine(5, 10)
myLine4 = gen.generateRandomLine(5, 10)
myLine5 = gen.generateRandomLine(5, 10)
myLine6 = gen.generateRandomLine(5, 10)
# print(gen)
# print(gen.stopList)
#gen.plotStops()

myGraph.clearEmptyNodes()
myGraph.normalizeID()
# gen.plotStops()

with open("python_scripts/gen-v2/gen-data/out.json", "w") as file:
    json.dump(myGraph.export(), file, indent=4)
